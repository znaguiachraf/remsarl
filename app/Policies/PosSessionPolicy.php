<?php

namespace App\Policies;

use App\Models\PosSession;
use App\Models\Project;
use App\Models\User;

class PosSessionPolicy
{
    public function openSession(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('pos.open_session') ?? false)
            || ($user->roleOnProject($project)?->hasPermission('pos.access') ?? false);
    }

    public function closeSession(User $user, PosSession $session): bool
    {
        return $user->isOwnerOf($session->project)
            || ($user->roleOnProject($session->project)?->hasPermission('pos.close_session') ?? false)
            || ($user->roleOnProject($session->project)?->hasPermission('pos.access') ?? false);
    }
}
