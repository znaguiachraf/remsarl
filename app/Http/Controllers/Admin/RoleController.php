<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::with('permissions')->orderBy('level', 'desc')->get()->map(fn ($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'slug' => $r->slug,
            'description' => $r->description,
            'level' => $r->level,
            'permissions' => $r->permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'slug' => $p->slug]),
        ]);

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::orderBy('module')->orderBy('slug')->get(['id', 'name', 'slug', 'module']);

        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $permissions->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'module' => $p->module,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'description' => 'nullable|string|max:500',
            'level' => 'required|integer|min:0|max:100',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'level' => $validated['level'],
        ]);

        if (!empty($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        return redirect()->route('admin.roles.index')->with('success', 'Role created.');
    }

    public function edit(Role $role): Response
    {
        $role->load('permissions');
        $permissions = Permission::orderBy('module')->orderBy('slug')->get(['id', 'name', 'slug', 'module']);

        return Inertia::render('Admin/Roles/Edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'level' => $role->level,
                'permission_ids' => $role->permissions->pluck('id')->toArray(),
            ],
            'permissions' => $permissions->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'module' => $p->module,
            ]),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug,' . $role->id,
            'description' => 'nullable|string|max:500',
            'level' => 'required|integer|min:0|max:100',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'level' => $validated['level'],
        ]);

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        return redirect()->route('admin.roles.index')->with('success', 'Role updated.');
    }

    public function destroy(Role $role)
    {
        if (in_array($role->slug, ['owner', 'admin', 'manager', 'member', 'viewer'])) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        $role->delete();

        return redirect()->route('admin.roles.index')->with('success', 'Role deleted.');
    }
}
