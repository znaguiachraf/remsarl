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
            'action' => $this->faker->randomElement(['created', 'updated', 'deleted', 'viewed']),
            'loggable_type' => $this->faker->randomElement(['App\\Models\\Product', 'App\\Models\\Task', 'App\\Models\\Project']),
            'loggable_id' => $this->faker->numberBetween(1, 100),
            'old_values' => null,
            'new_values' => null,
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'module' => $this->faker->randomElement(['products', 'tasks', 'pos', 'sales']),
            'description' => $this->faker->sentence(),
        ];
    }
}
