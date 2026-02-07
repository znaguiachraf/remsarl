<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Worker;

class TaskPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('task.view') ?? false)
            || $this->userIsWorkerInProject($user, $project);
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->isOwnerOf($task->project)) {
            return true;
        }
        if ($user->roleOnProject($task->project)?->hasPermission('task.view') ?? false) {
            return true;
        }
        // Worker can view own tasks
        return $task->worker_id && $task->worker->user_id === $user->id;
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('task.create') ?? false);
    }

    public function assign(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('task.assign') ?? false);
    }

    public function complete(User $user, Task $task): bool
    {
        if ($user->isOwnerOf($task->project)) {
            return true;
        }
        if ($user->roleOnProject($task->project)?->hasPermission('task.complete') ?? false) {
            return true;
        }
        // Worker can complete own assigned tasks
        return $task->worker_id && $task->worker->user_id === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->isOwnerOf($task->project)
            || ($user->roleOnProject($task->project)?->hasPermission('task.delete') ?? false);
    }

    protected function userIsWorkerInProject(User $user, Project $project): bool
    {
        return Worker::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->exists();
    }
}
