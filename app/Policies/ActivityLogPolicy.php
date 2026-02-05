<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;

class ActivityLogPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('log.view') ?? false);
    }

    public function view(User $user, ActivityLog $activityLog): bool
    {
        return $this->viewAny($user, $activityLog->project);
    }
}
