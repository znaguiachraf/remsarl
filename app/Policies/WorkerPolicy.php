<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Models\Worker;

class WorkerPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('worker.view') ?? false);
    }

    public function view(User $user, Worker $worker): bool
    {
        return $user->isOwnerOf($worker->project)
            || ($user->roleOnProject($worker->project)?->hasPermission('worker.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('worker.create') ?? false);
    }

    public function update(User $user, Worker $worker): bool
    {
        return $user->isOwnerOf($worker->project)
            || ($user->roleOnProject($worker->project)?->hasPermission('worker.update') ?? false);
    }

    public function delete(User $user, Worker $worker): bool
    {
        return $user->isOwnerOf($worker->project)
            || ($user->roleOnProject($worker->project)?->hasPermission('worker.delete') ?? false);
    }
}
