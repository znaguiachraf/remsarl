<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            Supplier::factory()->count(3)->create([
                'project_id' => $project->id,
            ]);
        }
    }
}
