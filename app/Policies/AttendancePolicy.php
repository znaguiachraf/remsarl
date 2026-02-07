<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\Project;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('attendance.view') ?? false);
    }

    public function view(User $user, Attendance $attendance): bool
    {
        return $user->isOwnerOf($attendance->project)
            || ($user->roleOnProject($attendance->project)?->hasPermission('attendance.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('attendance.create') ?? false);
    }

    public function update(User $user, Attendance $attendance): bool
    {
        return $user->isOwnerOf($attendance->project)
            || ($user->roleOnProject($attendance->project)?->hasPermission('attendance.update') ?? false);
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        return $user->isOwnerOf($attendance->project)
            || ($user->roleOnProject($attendance->project)?->hasPermission('attendance.delete') ?? false);
    }
}
