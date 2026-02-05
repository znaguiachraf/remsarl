<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'is_blocked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_blocked' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function isBlocked(): bool
    {
        return (bool) $this->is_blocked;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────────

    /** @return BelongsToMany<Project> */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withPivot(['role_id', 'status', 'invited_at', 'joined_at'])
            ->withTimestamps()
            ->using(ProjectUser::class);
    }

    public function projectMemberships(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectUser::class);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────

    public function roleOnProject(Project|int $project): ?Role
    {
        $projectId = $project instanceof Project ? $project->id : $project;
        $membership = $this->projectMemberships()->where('project_id', $projectId)->first();

        return $membership?->role;
    }

    public function hasProjectAccess(Project|int $project): bool
    {
        $projectId = $project instanceof Project ? $project->id : $project;

        return $this->projects()->where('project_id', $projectId)->wherePivot('status', 'active')->exists();
    }

    public function isOwnerOf(Project $project): bool
    {
        return $project->owner_id === $this->id;
    }
}
