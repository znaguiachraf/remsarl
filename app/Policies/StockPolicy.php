<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class StockPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('stock.view') ?? false);
    }

    public function adjust(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('stock.adjust') ?? false);
    }

    public function viewHistory(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('stock.history') ?? false);
    }
}
