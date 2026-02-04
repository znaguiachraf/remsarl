<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectUser;
use App\Models\Role;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectWorkerController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Project $project): Response
    {
        $this->authorize('manageMembers', $project);

        $workers = ProjectUser::where('project_id', $project->id)
            ->with(['user', 'role'])
            ->get()
            ->map(fn ($membership) => [
            'id' => $membership->user->id,
            'name' => $membership->user->name,
            'email' => $membership->user->email,
            'role' => [
                'id' => $membership->role_id,
                'name' => $membership->role?->name ?? null,
                'slug' => $membership->role?->slug ?? null,
            ],
            'status' => $membership->status->value,
            'joined_at' => $membership->joined_at?->toISOString(),
        ]);

        return Inertia::render('Projects/Workers/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'workers' => $workers,
            'roles' => Role::orderBy('level', 'desc')->get(['id', 'name', 'slug'])->toArray(),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('manageMembers', $project);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();
        $role = Role::findOrFail($validated['role_id']);

        $this->projectService->assignUser($project, $user, $role);

        return back()->with('success', 'Worker assigned.');
    }

    public function update(Request $request, Project $project, User $worker)
    {
        $this->authorize('manageMembers', $project);

        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $this->projectService->updateUserRole($project, $worker, $role);

        return back()->with('success', 'Role updated.');
    }

    public function destroy(Project $project, User $worker)
    {
        $this->authorize('manageMembers', $project);

        $this->ensureWorkerBelongsToProject($project, $worker);

        $this->projectService->removeUser($project, $worker);

        return back()->with('success', 'Worker removed.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, User $worker): void
    {
        if (!ProjectUser::where('project_id', $project->id)->where('user_id', $worker->id)->exists()) {
            abort(403, 'Worker does not belong to this project.');
        }
    }
}
