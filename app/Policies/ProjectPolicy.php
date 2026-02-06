<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any projects.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        return $user->isAdmin() || $user->hasProjectAccess($project);
    }

    /**
     * Determine whether the user can create projects.
     * Only platform admins can create projects.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        return $user->isAdmin()
            || $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('projects.update') ?? false);
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project);
    }

    /**
     * Determine whether the user can restore the project.
     */
    public function restore(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project);
    }

    /**
     * Determine whether the user can manage members (assign/remove users, edit roles).
     * Platform admins can manage any project's members.
     */
    public function manageMembers(User $user, Project $project): bool
    {
        return $user->isAdmin()
            || $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('projects.manage-members') ?? false);
    }

    /**
     * Determine whether the user can manage modules (enable/disable).
     */
    public function manageModules(User $user, Project $project): bool
    {
        return $user->isAdmin()
            || $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('projects.manage-modules') ?? false);
    }
}
