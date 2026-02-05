<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Project;
use App\Services\ModuleService;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function __construct(
        protected ModuleService $moduleService,
        protected ProjectService $projectService
    ) {}

    public function index(): Response
    {
        $projects = Project::orderBy('name')->get()->map(function (Project $project) {
            $enabledKeys = $this->moduleService->getEnabledModuleKeys($project);

            return [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'enabled_modules' => $enabledKeys,
                'enabled_count' => count($enabledKeys),
            ];
        });

        return Inertia::render('Admin/Modules/Index', [
            'projects' => $projects,
        ]);
    }

    public function edit(Project $project): Response
    {
        $availableModules = $this->moduleService->getAvailableModules();
        $enabledKeys = $this->moduleService->getEnabledModuleKeys($project);

        return Inertia::render('Admin/Modules/Edit', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
            ],
            'modules' => $availableModules->map(fn ($m) => [
                'key' => $m->key,
                'name' => $m->name,
                'description' => $m->description,
                'icon' => $m->icon,
            ]),
            'enabled_module_keys' => $enabledKeys,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'enabled_module_keys' => 'nullable|array',
            'enabled_module_keys.*' => 'string|exists:modules,key',
        ]);

        $keys = $validated['enabled_module_keys'] ?? [];
        $this->projectService->setEnabledModules($project, $keys);

        return redirect()->route('admin.modules.index')->with('success', 'Modules updated.');
    }
}
