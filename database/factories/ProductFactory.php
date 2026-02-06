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
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->optional()->sentence(),
            'price' => $this->faker->randomFloat(2, 5, 500),
            'cost_price' => $this->faker->optional()->randomFloat(2, 2, 200),
            'unit' => $this->faker->randomElement(['pcs', 'kg', 'box', 'unit']),
            'supplier_id' => null,
            'image' => null,
            'is_active' => true,
        ];
    }
}
