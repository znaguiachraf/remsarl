<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    public function index(): Response
    {
        $permissions = Permission::orderBy('module')->orderBy('slug')->get();

        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'module' => $p->module,
                'description' => $p->description,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Permissions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:permissions,slug',
            'module' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        Permission::create($validated);

        return redirect()->route('admin.permissions.index')->with('success', 'Permission created.');
    }

    public function edit(Permission $permission): Response
    {
        return Inertia::render('Admin/Permissions/Edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'slug' => $permission->slug,
                'module' => $permission->module,
                'description' => $permission->description,
            ],
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:permissions,slug,' . $permission->id,
            'module' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $permission->update($validated);

        return redirect()->route('admin.permissions.index')->with('success', 'Permission updated.');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        return redirect()->route('admin.permissions.index')->with('success', 'Permission deleted.');
    }
}
