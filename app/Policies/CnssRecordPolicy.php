<?php

namespace App\Policies;

use App\Models\CnssRecord;
use App\Models\Project;
use App\Models\User;

class CnssRecordPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('cnss.view') ?? false);
    }

    public function view(User $user, CnssRecord $cnssRecord): bool
    {
        return $user->isOwnerOf($cnssRecord->project)
            || ($user->roleOnProject($cnssRecord->project)?->hasPermission('cnss.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('cnss.create') ?? false);
    }

    public function update(User $user, CnssRecord $cnssRecord): bool
    {
        return $user->isOwnerOf($cnssRecord->project)
            || ($user->roleOnProject($cnssRecord->project)?->hasPermission('cnss.update') ?? false);
    }

    public function delete(User $user, CnssRecord $cnssRecord): bool
    {
        return $user->isOwnerOf($cnssRecord->project)
            || ($user->roleOnProject($cnssRecord->project)?->hasPermission('cnss.delete') ?? false);
    }
}
