<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $users = $project->users()->pluck('users.id');

            ActivityLog::factory()->count(10)->create([
                'project_id' => $project->id,
                'user_id' => $users->isEmpty() ? $project->owner_id : $users->random(),
            ]);
        }
    }
}
