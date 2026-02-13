<?php

namespace App\Models;

use App\Enums\ExpenseStatus;
use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use BelongsToProject, HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'expense_category_id',
        'reference',
        'description',
        'amount',
        'status',
        'expense_date',
        'user_id',
        'attachments',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'status' => ExpenseStatus::class,
        'attachments' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function expenseCategory(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function isPaid(): bool
    {
        return $this->status === ExpenseStatus::Paid;
    }

    public function getTotalDueAttribute(): float
    {
        return (float) $this->amount;
    }

    public function getTotalPaidAttribute(): float
    {
        return $this->status === ExpenseStatus::Paid ? (float) $this->amount : 0;
    }
}
