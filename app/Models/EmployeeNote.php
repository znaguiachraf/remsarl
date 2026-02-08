<?php

namespace App\Models;

use App\Enums\NoteDirection;
use App\Models\Concerns\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeNote extends Model
{
    use BelongsToProject, HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'worker_id',
        'author_id',
        'content',
        'direction',
    ];

    protected $casts = [
        'direction' => NoteDirection::class,
    ];

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
