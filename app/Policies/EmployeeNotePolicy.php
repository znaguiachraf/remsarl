<?php

namespace App\Policies;

use App\Models\EmployeeNote;
use App\Models\Project;
use App\Models\User;

class EmployeeNotePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('worker.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('worker.update') ?? false);
    }
}
