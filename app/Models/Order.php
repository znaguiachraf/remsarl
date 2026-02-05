<?php

namespace App\Models;

use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use BelongsToProject, SoftDeletes;

    protected $fillable = [
        'project_id',
        'order_number',
        'status',
        'supplier_id',
        'user_id',
        'subtotal',
        'tax',
        'total',
        'notes',
        'ordered_at',
        'received_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'ordered_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
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
}
