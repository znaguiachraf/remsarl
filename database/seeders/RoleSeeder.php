<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View Projects', 'slug' => 'projects.view', 'module' => 'core'],
            ['name' => 'Update Projects', 'slug' => 'projects.update', 'module' => 'core'],
            ['name' => 'Manage Project Members', 'slug' => 'projects.manage-members', 'module' => 'core'],
            ['name' => 'Manage Project Modules', 'slug' => 'projects.manage-modules', 'module' => 'core'],
            ['name' => 'Access POS', 'slug' => 'pos.access', 'module' => 'pos'],
            ['name' => 'Access Tasks', 'slug' => 'tasks.access', 'module' => 'tasks'],
            ['name' => 'Access Payments', 'slug' => 'payments.access', 'module' => 'payments'],
            ['name' => 'Access Orders', 'slug' => 'orders.access', 'module' => 'orders'],
            ['name' => 'Access Products', 'slug' => 'products.access', 'module' => 'products'],
            ['name' => 'Access Stock', 'slug' => 'stock.access', 'module' => 'stock'],
            ['name' => 'Access Sales', 'slug' => 'sales.access', 'module' => 'sales'],
            ['name' => 'Access Expenses', 'slug' => 'expenses.access', 'module' => 'expenses'],
            ['name' => 'Access Suppliers', 'slug' => 'suppliers.access', 'module' => 'suppliers'],
            ['name' => 'Access Logs', 'slug' => 'logs.access', 'module' => 'logs'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        $roles = [
            [
                'name' => 'Owner',
                'slug' => 'owner',
                'description' => 'Full access to the project',
                'level' => 100,
                'permissions' => Permission::pluck('id')->toArray(),
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrative access',
                'level' => 80,
                'permissions' => Permission::whereNotIn('slug', ['projects.manage-modules'])->pluck('id')->toArray(),
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Management access',
                'level' => 60,
                'permissions' => Permission::whereIn('module', ['pos', 'tasks', 'payments', 'orders', 'products', 'stock', 'sales', 'expenses', 'suppliers', 'logs'])->pluck('id')->toArray(),
            ],
            [
                'name' => 'Member',
                'slug' => 'member',
                'description' => 'Standard access',
                'level' => 40,
                'permissions' => Permission::whereIn('slug', ['projects.view', 'pos.access', 'tasks.access', 'products.access', 'stock.access', 'sales.access'])->pluck('id')->toArray(),
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access',
                'level' => 20,
                'permissions' => Permission::where('slug', 'projects.view')->pluck('id')->toArray(),
            ],
        ];

        foreach ($roles as $roleData) {
            $permissionIds = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::firstOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );

            $role->permissions()->sync($permissionIds);
        }
    }
}
