<?php

namespace App\Models;

use App\Enums\AttendanceStatus;
use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use BelongsToProject, HasFactory;

    protected $fillable = [
        'project_id',
        'worker_id',
        'date',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'status' => AttendanceStatus::class,
    ];

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }
}
