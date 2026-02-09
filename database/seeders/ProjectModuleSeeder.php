<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Project;
use App\Models\ProjectModule;
use Illuminate\Database\Seeder;

class ProjectModuleSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();
        $modules = Module::where('is_active', true)->pluck('key');

        if ($projects->isEmpty() || $modules->isEmpty()) {
            return;
        }

        $enabledModuleSets = [
            ['pos', 'products', 'stock', 'sales', 'payments', 'expenses', 'suppliers', 'purchase', 'analytics', 'logs'],
            ['tasks', 'products', 'orders', 'payments', 'suppliers', 'purchase', 'analytics', 'logs'],
            ['products', 'stock', 'sales', 'analytics', 'logs'],
        ];

        foreach ($projects as $index => $project) {
            $moduleKeys = $enabledModuleSets[$index % count($enabledModuleSets)] ?? $modules->take(5)->toArray();

            foreach ($moduleKeys as $moduleKey) {
                ProjectModule::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'module_key' => $moduleKey,
                    ],
                    [
                        'config' => [],
                        'is_enabled' => true,
                    ]
                );
            }
        }
    }
}
