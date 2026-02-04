<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Project::class);

        $projects = auth()->user()->projects()->wherePivot('status', 'active')->get();

        return Inertia::render('Projects/Selector', [
            'projects' => $projects->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'logo' => $p->logo_url,
                'primary_color' => $p->primary_color,
                'status' => $p->status->value,
            ]),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Projects/Create', [
            'availableModules' => app(\App\Services\ModuleService::class)->getAvailableModules()->map(fn ($m) => [
                'key' => $m->key,
                'name' => $m->name,
                'description' => $m->description,
                'icon' => $m->icon,
            ])->values()->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'logo' => 'nullable|image|max:2048',
            'status' => 'nullable|in:active,suspended,archived',
            'enabled_modules' => 'nullable|array',
            'enabled_modules.*' => 'string|in:pos,tasks,payments,orders,products,stock,sales,expenses,suppliers,logs',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }
        $validated['logo'] = $logoPath;

        $project = $this->projectService->create($validated, $request->user());

        if (!empty($validated['enabled_modules'])) {
            $this->projectService->setEnabledModules($project, $validated['enabled_modules']);
        }

        return redirect()->route('projects.show', $project)->with('success', 'Project created successfully.');
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        return Inertia::render('Projects/Dashboard', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'logo' => $project->logo_url,
                'primary_color' => $project->primary_color,
                'secondary_color' => $project->secondary_color,
                'status' => $project->status->value,
                'description' => $project->description,
            ],
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'status' => 'nullable|in:active,suspended,archived',
        ]);

        $this->projectService->update($project, $validated);

        return back()->with('success', 'Project updated.');
    }
}
