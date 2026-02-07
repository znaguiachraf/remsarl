<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'icon',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    // ─────────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────────

    /** @return BelongsToMany<Project> */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_modules', 'module_key', 'project_id', 'key', 'id')
            ->withPivot(['config', 'is_enabled'])
            ->withTimestamps();
    }

    public function projectModules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectModule::class, 'module_key', 'key');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────

    public function isEnabledForProject(Project|int $project): bool
    {
        $projectId = $project instanceof Project ? $project->id : $project;

        return ProjectModule::where('project_id', $projectId)
            ->where('module_key', $this->key)
            ->where('is_enabled', true)
            ->exists();
    }

    /**
     * Get module keys for all available modules.
     */
    public static function availableKeys(): array
    {
        return [
            'pos',
            'tasks',
            'payments',
            'orders',
            'products',
            'stock',
            'sales',
            'expenses',
            'suppliers',
            'hr',
            'logs',
        ];
    }
}
