<?php

namespace Database\Seeders;

use App\Enums\UserProjectStatus;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectUserSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();
        $users = User::all();
        $roles = Role::orderBy('level', 'desc')->get()->keyBy('slug');

        if ($projects->isEmpty() || $users->isEmpty()) {
            return;
        }

        foreach ($projects as $project) {
            $owner = $project->owner;
            $ownerRole = $roles->get('owner');
            if ($owner && $ownerRole) {
                $project->users()->syncWithoutDetaching([
                    $owner->id => [
                        'role_id' => $ownerRole->id,
                        'status' => UserProjectStatus::Active,
                        'joined_at' => now(),
                    ],
                ]);
            }

            $otherUsers = $users->where('id', '!=', $project->owner_id)->take(3);
            $memberRole = $roles->get('member');
            $managerRole = $roles->get('manager');

            foreach ($otherUsers as $index => $user) {
                $role = $index === 0 ? $managerRole : $memberRole;
                if ($role && !$project->users()->where('user_id', $user->id)->exists()) {
                    $project->users()->attach($user->id, [
                        'role_id' => $role->id,
                        'status' => UserProjectStatus::Active,
                        'joined_at' => now(),
                    ]);
                }
            }
        }
    }
}
