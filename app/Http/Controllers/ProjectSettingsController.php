<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectSettingsController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Project $project): Response
    {
        $this->authorize('update', $project);

        $project->load([]);

        return Inertia::render('Projects/Settings/Index', [
            'project' => $this->projectToSettingsArray($project),
        ]);
    }

    public function updateProject(Request $request, Project $project)
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
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($project->logo) {
                Storage::disk('public')->delete($project->logo);
            }
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        } else {
            unset($validated['logo']);
        }

        $this->projectService->update($project, $validated);

        return back()->with('success', 'Project information updated.');
    }

    public function updateEmail(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'mail_from_name' => 'nullable|string|max:255',
            'mail_from_address' => 'nullable|email',
            'smtp_driver' => 'nullable|string|in:smtp',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_username' => 'nullable|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'smtp_encryption' => 'nullable|string|in:tls,ssl,null',
        ]);

        if (empty($validated['smtp_password'])) {
            unset($validated['smtp_password']);
        } else {
            $validated['smtp_password'] = Crypt::encryptString($validated['smtp_password']);
        }

        $validated['smtp_encryption'] = ($validated['smtp_encryption'] ?? null) === 'null' ? null : ($validated['smtp_encryption'] ?? null);

        $project->update($validated);

        return back()->with('success', 'Email settings updated.');
    }

    protected function projectToSettingsArray(Project $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'slug' => $project->slug,
            'logo' => $project->logo_url,
            'primary_color' => $project->primary_color ?? '#3B82F6',
            'secondary_color' => $project->secondary_color ?? '#10B981',
            'address' => $project->address,
            'phone' => $project->phone,
            'description' => $project->description,
            'city' => $project->city,
            'country' => $project->country,
            'status' => $project->status->value ?? 'active',
            'mail_from_name' => $project->mail_from_name,
            'mail_from_address' => $project->mail_from_address,
            'smtp_driver' => $project->smtp_driver ?? 'smtp',
            'smtp_host' => $project->smtp_host,
            'smtp_port' => $project->smtp_port,
            'smtp_username' => $project->smtp_username,
            'smtp_password' => $project->smtp_password ? '••••••••' : null,
            'smtp_encryption' => $project->smtp_encryption ?? 'tls',
        ];
    }
}
