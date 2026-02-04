<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectRoleController extends Controller
{
    public function index(Project $project): Response
    {
        $this->authorize('manageMembers', $project);

        $roles = Role::with('permissions')->orderBy('level', 'desc')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'level' => $role->level,
            'permissions' => $role->permissions->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'module' => $p->module,
            ]),
        ]);

        return Inertia::render('Projects/Roles/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'roles' => $roles,
        ]);
    }
}
