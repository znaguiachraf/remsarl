<?php

namespace Database\Factories;

use App\Enums\NoteDirection;
use App\Models\EmployeeNote;
use App\Models\Project;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeNoteFactory extends Factory
{
    protected $model = EmployeeNote::class;

    public function definition(): array
    {
        $project = Project::factory();

        return [
            'project_id' => $project,
            'worker_id' => Worker::factory()->for($project),
            'author_id' => User::factory(),
            'content' => $this->faker->paragraph(),
            'direction' => $this->faker->randomElement(NoteDirection::cases()),
        ];
    }
}
