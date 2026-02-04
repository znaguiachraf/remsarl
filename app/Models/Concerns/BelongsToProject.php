<?php

namespace App\Models\Concerns;

use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trait for models that belong to a project.
 *
 * RULES:
 * - All business data MUST include project_id
 * - Never mix data between projects
 * - All queries MUST be scoped by project_id using forProject() or where('project_id', $project->id)
 */
trait BelongsToProject
{
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Scope to filter by project. Use this on ALL queries for project-scoped models.
     */
    public function scopeForProject(Builder $query, Project|int $project): Builder
    {
        $projectId = $project instanceof Project ? $project->id : $project;

        return $query->where('project_id', $projectId);
    }

    /**
     * Ensure project_id is set when creating. Call from booted() if needed.
     */
    protected static function bootBelongsToProject(): void
    {
        static::creating(function (Model $model) {
            if (empty($model->project_id) && in_array('project_id', $model->getFillable(), true)) {
                throw new \InvalidArgumentException('project_id is required for ' . static::class);
            }
        });
    }
}
