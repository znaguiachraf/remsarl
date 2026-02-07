<?php

namespace App\Models;

use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use BelongsToProject, SoftDeletes;

    protected $fillable = [
        'project_id',
        'sale_number',
        'status',
        'subtotal',
        'discount',
        'tax',
        'total',
        'user_id',
        'source',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function getTotalDueAttribute(): float
    {
        return (float) $this->total;
    }

    public function getTotalPaidAttribute(): float
    {
        return (float) $this->payments()
            ->whereNotIn('status', ['failed', 'refunded'])
            ->sum('amount');
    }

    /**
     * Payment status: unpaid, partial, paid (computed from total_paid vs total).
     */
    public function getPaymentStatusAttribute(): string
    {
        if (in_array($this->status, ['cancelled', 'refunded'])) {
            return $this->status;
        }

        $total = (float) $this->total;
        $paid = (float) $this->total_paid;

        if ($total <= 0) {
            return 'paid';
        }
        if ($paid <= 0) {
            return 'unpaid';
        }
        if ($paid >= $total) {
            return 'paid';
        }

        return 'partial';
    }
}
