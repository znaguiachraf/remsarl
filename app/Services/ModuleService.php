<?php

namespace App\Services;

use App\Models\Module;
use App\Models\Project;
use App\Models\ProjectModule;

class ModuleService
{
    /**
     * Get all available modules.
     */
    public function getAvailableModules(): \Illuminate\Database\Eloquent\Collection
    {
        return Module::where('is_active', true)->orderBy('sort_order')->get();
    }

    /**
     * Check if module is enabled for project.
     */
    public function isModuleEnabled(Project|int $project, string $moduleKey): bool
    {
        $projectId = $project instanceof Project ? $project->id : $project;

        return ProjectModule::where('project_id', $projectId)
            ->where('module_key', $moduleKey)
            ->where('is_enabled', true)
            ->exists();
    }

    /**
     * Get enabled module keys for project.
     */
    public function getEnabledModuleKeys(Project|int $project): array
    {
        $projectId = $project instanceof Project ? $project->id : $project;

        return ProjectModule::where('project_id', $projectId)
            ->where('is_enabled', true)
            ->pluck('module_key')
            ->toArray();
    }

    /**
     * Get project module config.
     */
    public function getModuleConfig(Project $project, string $moduleKey): array
    {
        $projectModule = ProjectModule::where('project_id', $project->id)
            ->where('module_key', $moduleKey)
            ->where('is_enabled', true)
            ->first();

        return $projectModule?->config ?? [];
    }

    /**
     * Validate that the project has access to the module (throws if not).
     */
    public function ensureModuleEnabled(Project $project, string $moduleKey): void
    {
        if (!$this->isModuleEnabled($project, $moduleKey)) {
            abort(403, "Module [{$moduleKey}] is not enabled for this project.");
        }
    }
}
