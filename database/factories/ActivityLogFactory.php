<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'action' => fake()->randomElement(['created', 'updated', 'deleted', 'viewed']),
            'loggable_type' => fake()->randomElement(['App\\Models\\Product', 'App\\Models\\Task', 'App\\Models\\Project']),
            'loggable_id' => fake()->numberBetween(1, 100),
            'old_values' => null,
            'new_values' => null,
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'module' => fake()->randomElement(['products', 'tasks', 'pos', 'sales']),
            'description' => fake()->sentence(),
        ];
    }
}
