<?php

namespace App\Models;

use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosPayment extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id',
        'pos_order_id',
        'payment_method',
        'amount',
        'reference',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function posOrder(): BelongsTo
    {
        return $this->belongsTo(PosOrder::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
