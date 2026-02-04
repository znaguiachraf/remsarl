<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\ProjectModule;
use App\Models\User;

class ProjectModulePolicy
{
    /**
     * Determine whether the user can access the module within the project.
     */
    public function view(User $user, Project $project, string $moduleKey): bool
    {
        if (!$user->hasProjectAccess($project)) {
            return false;
        }

        return $project->hasModule($moduleKey);
    }

    /**
     * Determine whether the user can enable/disable modules.
     */
    public function manage(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project) || $user->roleOnProject($project)?->hasPermission('projects.manage-modules') ?? false;
    }
}
