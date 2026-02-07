<?php

namespace App\Models;

use App\Enums\CnssRecordStatus;
use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CnssRecord extends Model
{
    use BelongsToProject, HasFactory;

    protected $fillable = [
        'project_id',
        'worker_id',
        'registration_number',
        'registration_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'registration_date' => 'date',
        'status' => CnssRecordStatus::class,
    ];

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }
}
