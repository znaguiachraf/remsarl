<?php

namespace App\Models;

use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id',
        'order_number',
        'status',
        'supplier_id',
        'user_id',
        'subtotal',
        'tax',
        'total',
        'bill_reference',
        'bill_amount',
        'ordered_at',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'bill_amount' => 'decimal:2',
        'ordered_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'purchase_order_id');
    }

    public function isFullyReceived(): bool
    {
        return $this->items->every(fn ($item) => $item->quantity_received >= $item->quantity_ordered);
    }

    public function hasPartialReceipt(): bool
    {
        return $this->items->contains(fn ($item) => $item->quantity_received > 0);
    }
}
