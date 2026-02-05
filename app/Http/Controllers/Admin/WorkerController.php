<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectUser;
use App\Models\Role;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkerController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): Response
    {
        $query = ProjectUser::with(['user', 'project', 'role'])
            ->orderBy('project_id')
            ->orderBy('user_id');

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $assignments = $query->get()->map(fn ($pu) => [
            'id' => $pu->id,
            'user' => [
                'id' => $pu->user->id,
                'name' => $pu->user->name,
                'email' => $pu->user->email,
            ],
            'project' => [
                'id' => $pu->project->id,
                'name' => $pu->project->name,
            ],
            'role' => [
                'id' => $pu->role->id,
                'name' => $pu->role->name,
            ],
            'status' => $pu->status->value,
        ]);

        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $roles = Role::orderBy('level', 'desc')->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Workers/Index', [
            'assignments' => $assignments,
            'users' => $users->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]),
            'projects' => $projects->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
            'roles' => $roles->map(fn ($r) => ['id' => $r->id, 'name' => $r->name, 'slug' => $r->slug]),
            'filters' => [
                'project_id' => $request->project_id,
                'user_id' => $request->user_id,
                'role_id' => $request->role_id,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'project_id' => 'required|exists:projects,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $project = Project::findOrFail($validated['project_id']);
        $role = Role::findOrFail($validated['role_id']);

        if ($project->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is already assigned to this project.');
        }

        $this->projectService->assignUser($project, $user, $role);

        return back()->with('success', 'User assigned to project.');
    }

    public function destroy(ProjectUser $project_user)
    {
        $project = $project_user->project;
        $user = $project_user->user;

        $this->projectService->removeUser($project, $user);

        return back()->with('success', 'Worker removed from project.');
    }
}
