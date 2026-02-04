<?php

namespace App\Models;

use App\Enums\UserProjectStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProjectUser extends Pivot
{
    protected $table = 'project_user';

    public $incrementing = true;

    protected $fillable = [
        'project_id',
        'user_id',
        'role_id',
        'status',
        'invited_at',
        'joined_at',
    ];

    protected $casts = [
        'status' => UserProjectStatus::class,
        'invited_at' => 'datetime',
        'joined_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────

    public function hasPermission(string $permissionSlug): bool
    {
        return $this->role?->hasPermission($permissionSlug) ?? false;
    }

    public function isActive(): bool
    {
        return $this->status === UserProjectStatus::Active;
    }
}
