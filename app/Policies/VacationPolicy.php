<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Models\Vacation;

class VacationPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('vacation.view') ?? false);
    }

    public function view(User $user, Vacation $vacation): bool
    {
        return $user->isOwnerOf($vacation->project)
            || ($user->roleOnProject($vacation->project)?->hasPermission('vacation.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('vacation.create') ?? false);
    }

    public function update(User $user, Vacation $vacation): bool
    {
        return $user->isOwnerOf($vacation->project)
            || ($user->roleOnProject($vacation->project)?->hasPermission('vacation.update') ?? false);
    }

    public function delete(User $user, Vacation $vacation): bool
    {
        return $user->isOwnerOf($vacation->project)
            || ($user->roleOnProject($vacation->project)?->hasPermission('vacation.delete') ?? false);
    }

    public function approve(User $user, Vacation $vacation): bool
    {
        return $user->isOwnerOf($vacation->project)
            || ($user->roleOnProject($vacation->project)?->hasPermission('vacation.approve') ?? false);
    }

    public function reject(User $user, Vacation $vacation): bool
    {
        return $user->isOwnerOf($vacation->project)
            || ($user->roleOnProject($vacation->project)?->hasPermission('vacation.approve') ?? false);
    }
}
