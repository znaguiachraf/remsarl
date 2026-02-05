<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Project;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->randomFloat(2, 5, 500),
            'cost_price' => fake()->optional()->randomFloat(2, 2, 200),
            'unit' => fake()->randomElement(['pcs', 'kg', 'box', 'unit']),
            'supplier_id' => null,
            'image' => null,
            'is_active' => true,
        ];
    }
}
