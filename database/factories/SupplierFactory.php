<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'name' => fake()->company(),
            'contact_person' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'notes' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }
}
