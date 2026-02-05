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
            ['name' => 'View Payments', 'slug' => 'payment.view', 'module' => 'payments'],
            ['name' => 'Create Payments', 'slug' => 'payment.create', 'module' => 'payments'],
            ['name' => 'Update Payments', 'slug' => 'payment.update', 'module' => 'payments'],
            ['name' => 'Refund Payments', 'slug' => 'payment.refund', 'module' => 'payments'],
            ['name' => 'Delete Payments', 'slug' => 'payment.delete', 'module' => 'payments'],
            ['name' => 'Access Orders', 'slug' => 'orders.access', 'module' => 'orders'],
            ['name' => 'View Products', 'slug' => 'product.view', 'module' => 'products'],
            ['name' => 'Create Products', 'slug' => 'product.create', 'module' => 'products'],
            ['name' => 'Update Products', 'slug' => 'product.update', 'module' => 'products'],
            ['name' => 'Delete Products', 'slug' => 'product.delete', 'module' => 'products'],
            ['name' => 'View Stock', 'slug' => 'stock.view', 'module' => 'stock'],
            ['name' => 'Adjust Stock', 'slug' => 'stock.adjust', 'module' => 'stock'],
            ['name' => 'View Stock History', 'slug' => 'stock.history', 'module' => 'stock'],
            ['name' => 'View Sales', 'slug' => 'sale.view', 'module' => 'sales'],
            ['name' => 'Create Sales', 'slug' => 'sale.create', 'module' => 'sales'],
            ['name' => 'Update Sales', 'slug' => 'sale.update', 'module' => 'sales'],
            ['name' => 'Record Payments', 'slug' => 'sale.pay', 'module' => 'sales'],
            ['name' => 'View Expenses', 'slug' => 'expense.view', 'module' => 'expenses'],
            ['name' => 'Create Expenses', 'slug' => 'expense.create', 'module' => 'expenses'],
            ['name' => 'Update Expenses', 'slug' => 'expense.update', 'module' => 'expenses'],
            ['name' => 'Pay Expenses', 'slug' => 'expense.pay', 'module' => 'expenses'],
            ['name' => 'Access Suppliers', 'slug' => 'suppliers.access', 'module' => 'suppliers'],
            ['name' => 'View Activity Logs', 'slug' => 'log.view', 'module' => 'logs'],
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
                'permissions' => Permission::whereIn('slug', ['projects.view', 'pos.access', 'tasks.access', 'product.view', 'stock.view', 'stock.history', 'sale.view', 'sale.pay', 'expense.view', 'expense.create', 'payment.view'])->pluck('id')->toArray(),
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
