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
            ['name' => 'View Suppliers', 'slug' => 'supplier.view', 'module' => 'suppliers'],
            ['name' => 'Create Suppliers', 'slug' => 'supplier.create', 'module' => 'suppliers'],
            ['name' => 'Update Suppliers', 'slug' => 'supplier.update', 'module' => 'suppliers'],
            ['name' => 'Delete Suppliers', 'slug' => 'supplier.delete', 'module' => 'suppliers'],
            ['name' => 'View Workers', 'slug' => 'worker.view', 'module' => 'hr'],
            ['name' => 'Create Workers', 'slug' => 'worker.create', 'module' => 'hr'],
            ['name' => 'Update Workers', 'slug' => 'worker.update', 'module' => 'hr'],
            ['name' => 'Delete Workers', 'slug' => 'worker.delete', 'module' => 'hr'],
            ['name' => 'View Contracts', 'slug' => 'contract.view', 'module' => 'hr'],
            ['name' => 'Create Contracts', 'slug' => 'contract.create', 'module' => 'hr'],
            ['name' => 'Update Contracts', 'slug' => 'contract.update', 'module' => 'hr'],
            ['name' => 'Delete Contracts', 'slug' => 'contract.delete', 'module' => 'hr'],
            ['name' => 'View Salaries', 'slug' => 'salary.view', 'module' => 'hr'],
            ['name' => 'Create Salaries', 'slug' => 'salary.create', 'module' => 'hr'],
            ['name' => 'Update Salaries', 'slug' => 'salary.update', 'module' => 'hr'],
            ['name' => 'Delete Salaries', 'slug' => 'salary.delete', 'module' => 'hr'],
            ['name' => 'View Attendance', 'slug' => 'attendance.view', 'module' => 'hr'],
            ['name' => 'Create Attendance', 'slug' => 'attendance.create', 'module' => 'hr'],
            ['name' => 'Update Attendance', 'slug' => 'attendance.update', 'module' => 'hr'],
            ['name' => 'Delete Attendance', 'slug' => 'attendance.delete', 'module' => 'hr'],
            ['name' => 'View Vacations', 'slug' => 'vacation.view', 'module' => 'hr'],
            ['name' => 'Create Vacations', 'slug' => 'vacation.create', 'module' => 'hr'],
            ['name' => 'Update Vacations', 'slug' => 'vacation.update', 'module' => 'hr'],
            ['name' => 'Delete Vacations', 'slug' => 'vacation.delete', 'module' => 'hr'],
            ['name' => 'Approve Vacations', 'slug' => 'vacation.approve', 'module' => 'hr'],
            ['name' => 'View CNSS', 'slug' => 'cnss.view', 'module' => 'hr'],
            ['name' => 'Create CNSS', 'slug' => 'cnss.create', 'module' => 'hr'],
            ['name' => 'Update CNSS', 'slug' => 'cnss.update', 'module' => 'hr'],
            ['name' => 'Delete CNSS', 'slug' => 'cnss.delete', 'module' => 'hr'],
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
                'permissions' => Permission::whereIn('module', ['pos', 'tasks', 'payments', 'orders', 'products', 'stock', 'sales', 'expenses', 'suppliers', 'hr', 'logs'])->pluck('id')->toArray(),
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
