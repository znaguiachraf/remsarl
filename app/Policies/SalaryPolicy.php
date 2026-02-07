<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Salary;
use App\Models\User;

class SalaryPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('salary.view') ?? false);
    }

    public function view(User $user, Salary $salary): bool
    {
        return $user->isOwnerOf($salary->project)
            || ($user->roleOnProject($salary->project)?->hasPermission('salary.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('salary.create') ?? false);
    }

    public function update(User $user, Salary $salary): bool
    {
        return $user->isOwnerOf($salary->project)
            || ($user->roleOnProject($salary->project)?->hasPermission('salary.update') ?? false);
    }

    public function delete(User $user, Salary $salary): bool
    {
        return $user->isOwnerOf($salary->project)
            || ($user->roleOnProject($salary->project)?->hasPermission('salary.delete') ?? false);
    }
}
