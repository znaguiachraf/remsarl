<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $name = $this->faker->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 99999),
            'logo' => null,
            'primary_color' => '#3B82F6',
            'secondary_color' => '#10B981',
            'address' => $this->faker->address(),
            'phone' => $this->faker->phoneNumber(),
            'description' => $this->faker->sentence(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'status' => ProjectStatus::Active,
            'owner_id' => User::factory(),
            'config' => null,
        ];
    }
}
