<?php

namespace App\Models;

use App\Enums\ContractStatus;
use App\Enums\ContractType;
use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use BelongsToProject, HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'worker_id',
        'type',
        'status',
        'start_date',
        'end_date',
        'salary_amount',
        'salary_currency',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'salary_amount' => 'decimal:2',
        'type' => ContractType::class,
        'status' => ContractStatus::class,
    ];

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    public function salaries(): HasMany
    {
        return $this->hasMany(Salary::class);
    }

    public function isActive(): bool
    {
        return $this->status === ContractStatus::Active;
    }
}
