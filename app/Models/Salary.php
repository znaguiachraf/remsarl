<?php

namespace App\Models;

use App\Enums\SalaryStatus;
use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Salary extends Model
{
    use BelongsToProject, HasFactory;

    protected $fillable = [
        'project_id',
        'worker_id',
        'contract_id',
        'month',
        'year',
        'gross_amount',
        'net_amount',
        'absent_days',
        'attendance_deduction',
        'status',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'absent_days' => 'decimal:1',
        'attendance_deduction' => 'decimal:2',
        'status' => SalaryStatus::class,
    ];

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
