<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['key' => 'pos', 'name' => 'POS', 'description' => 'Point of Sale', 'icon' => 'shopping-cart', 'sort_order' => 1],
            ['key' => 'tasks', 'name' => 'Task Management', 'description' => 'Manage tasks and assignments', 'icon' => 'check-square', 'sort_order' => 2],
            ['key' => 'payments', 'name' => 'Payment Management', 'description' => 'Track and manage payments', 'icon' => 'credit-card', 'sort_order' => 3],
            ['key' => 'orders', 'name' => 'Orders Management', 'description' => 'Purchase orders and fulfillment', 'icon' => 'clipboard-list', 'sort_order' => 4],
            ['key' => 'products', 'name' => 'Products', 'description' => 'Product catalog management', 'icon' => 'package', 'sort_order' => 5],
            ['key' => 'stock', 'name' => 'Stock', 'description' => 'Inventory and stock movements', 'icon' => 'archive', 'sort_order' => 6],
            ['key' => 'sales', 'name' => 'Sales', 'description' => 'Sales tracking and reports', 'icon' => 'trending-up', 'sort_order' => 7],
            ['key' => 'expenses', 'name' => 'Expenses', 'description' => 'Expense tracking', 'icon' => 'dollar-sign', 'sort_order' => 8],
            ['key' => 'suppliers', 'name' => 'Supplier Management', 'description' => 'Supplier and vendor management', 'icon' => 'truck', 'sort_order' => 9],
            ['key' => 'hr', 'name' => 'HR & Workers', 'description' => 'Workers, contracts, salaries, attendance, vacations', 'icon' => 'users', 'sort_order' => 10],
            ['key' => 'logs', 'name' => 'Activity Logs', 'description' => 'Project activity audit trail', 'icon' => 'file-text', 'sort_order' => 11],
        ];

        foreach ($modules as $module) {
            Module::updateOrCreate(
                ['key' => $module['key']],
                array_merge($module, ['is_active' => true])
            );
        }
    }
}
