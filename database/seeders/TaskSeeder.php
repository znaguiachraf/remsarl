<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $users = $project->users()->pluck('users.id');

            Task::factory()->count(5)->create([
                'project_id' => $project->id,
                'assignee_id' => $users->isEmpty() ? null : $users->random(),
                'created_by' => $project->owner_id,
            ]);
        }
    }
}
