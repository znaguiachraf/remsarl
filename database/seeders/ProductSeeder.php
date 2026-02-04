<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Project;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $suppliers = Supplier::where('project_id', $project->id)->get();

            Product::factory()->count(8)->create([
                'project_id' => $project->id,
                'supplier_id' => $suppliers->isEmpty() ? null : $suppliers->random()->id,
            ]);
        }
    }
}
