<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'primary_color',
        'secondary_color',
        'address',
        'phone',
        'description',
        'type',
        'city',
        'country',
        'status',
        'owner_id',
        'config',
        'mail_from_name',
        'mail_from_address',
        'smtp_driver',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_encryption',
    ];

    protected $casts = [
        'status' => ProjectStatus::class,
        'config' => 'array',
    ];

    protected $attributes = [
        'primary_color' => '#3B82F6',
        'secondary_color' => '#10B981',
    ];

    // ─────────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────────

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsToMany<User> */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot(['role_id', 'status', 'invited_at', 'joined_at'])
            ->withTimestamps()
            ->using(ProjectUser::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectUser::class)->where('status', 'active');
    }

    /** @return BelongsToMany<Module> via project_modules */
    public function enabledModules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'project_modules', 'project_id', 'module_key', 'id', 'key')
            ->withPivot(['config', 'is_enabled'])
            ->withTimestamps()
            ->wherePivot('is_enabled', true);
    }

    public function projectModules(): HasMany
    {
        return $this->hasMany(ProjectModule::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────

    public function hasModule(string $moduleKey): bool
    {
        return $this->projectModules()
            ->where('module_key', $moduleKey)
            ->where('is_enabled', true)
            ->exists();
    }

    public function getDecryptedSmtpPasswordAttribute(): ?string
    {
        if (empty($this->smtp_password)) {
            return null;
        }

        try {
            return \Illuminate\Support\Facades\Crypt::decryptString($this->smtp_password);
        } catch (\Throwable) {
            return null;
        }
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->slug)) {
                $project->slug = \Illuminate\Support\Str::slug($project->name);
            }
        });
    }
}
