<?php

namespace Database\Seeders;

use App\Enums\ExpenseStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProjectStatus;
use App\Enums\UserProjectStatus;
use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Module;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\PosPayment;
use App\Models\PosSession;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use App\Models\ProjectModule;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class FurnitureProjectSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();
        $owner = User::first();
        if (!$owner) {
            return;
        }

        $project = Project::updateOrCreate(
            ['slug' => 'furniture-store'],
            [
                'name' => 'Furniture Store',
                'type' => 'Furniture',
                'primary_color' => '#8B4513',
                'secondary_color' => '#D2691E',
                'address' => '456 Oak Avenue, Furniture District',
                'phone' => '+1 555 789 0123',
                'description' => 'Premium furniture retail and wholesale.',
                'city' => 'Chicago',
                'country' => 'USA',
                'status' => ProjectStatus::Active,
                'owner_id' => $owner->id,
            ]
        );

        // If project already had data, clear it for clean re-seed
        if ($project->wasRecentlyCreated === false) {
            ActivityLog::where('project_id', $project->id)->delete();
            PosPayment::where('project_id', $project->id)->delete();
            $posOrderIds = PosOrder::where('project_id', $project->id)->pluck('id');
            PosOrderItem::whereIn('pos_order_id', $posOrderIds)->delete();
            PosOrder::where('project_id', $project->id)->delete();
            PosSession::where('project_id', $project->id)->delete();
            Payment::where('project_id', $project->id)->delete();
            StockMovement::where('project_id', $project->id)->delete();
            $saleIds = Sale::where('project_id', $project->id)->pluck('id');
            SaleItem::whereIn('sale_id', $saleIds)->delete();
            Sale::where('project_id', $project->id)->forceDelete();
            Expense::where('project_id', $project->id)->forceDelete();
            Task::where('project_id', $project->id)->forceDelete();
            Order::where('project_id', $project->id)->forceDelete();
            Product::where('project_id', $project->id)->forceDelete();
            ProductCategory::where('project_id', $project->id)->delete();
            ExpenseCategory::where('project_id', $project->id)->delete();
            Supplier::where('project_id', $project->id)->delete();
            ProjectModule::where('project_id', $project->id)->delete();
            $project->users()->detach();
        }

        // Enable all modules
        $moduleKeys = Module::where('is_active', true)->pluck('key')->toArray();
        foreach ($moduleKeys as $key) {
            ProjectModule::create([
                'project_id' => $project->id,
                'module_key' => $key,
                'config' => [],
                'is_enabled' => true,
            ]);
        }

        // Assign users
        $ownerRole = Role::where('slug', 'owner')->first();
        $memberRole = Role::where('slug', 'member')->first();
        $managerRole = Role::where('slug', 'manager')->first();

        $project->users()->attach($owner->id, [
            'role_id' => $ownerRole?->id ?? $memberRole?->id,
            'status' => UserProjectStatus::Active,
            'joined_at' => now(),
        ]);

        $otherUsers = User::where('id', '!=', $owner->id)->take(3)->get();
        foreach ($otherUsers as $i => $user) {
            $role = $i === 0 ? $managerRole : $memberRole;
            if ($role && !$project->users()->where('user_id', $user->id)->exists()) {
                $project->users()->attach($user->id, [
                    'role_id' => $role->id,
                    'status' => UserProjectStatus::Active,
                    'joined_at' => now(),
                ]);
            }
        }

        // Product categories
        $categories = [
            ['name' => 'Sofas', 'color' => '#8B4513'],
            ['name' => 'Chairs', 'color' => '#A0522D'],
            ['name' => 'Tables', 'color' => '#CD853F'],
            ['name' => 'Beds', 'color' => '#D2691E'],
            ['name' => 'Shelves', 'color' => '#BC8F8F'],
        ];
        $productCategories = [];
        foreach ($categories as $c) {
            $productCategories[] = ProductCategory::create([
                'project_id' => $project->id,
                'name' => $c['name'],
                'color' => $c['color'],
                'description' => "{$c['name']} category",
                'is_active' => true,
            ]);
        }

        // Suppliers
        $suppliers = [];
        $supplierNames = ['Oak Wood Suppliers', 'Modern Furniture Co', 'Classic Designs Ltd', 'Premium Materials Inc'];
        foreach ($supplierNames as $i => $name) {
            $suppliers[] = Supplier::create([
                'project_id' => $project->id,
                'name' => $name,
                'contact_person' => $faker->name(),
                'email' => 'supplier' . $i . '-furniture@example.com',
                'phone' => $faker->phoneNumber(),
                'address' => $faker->address(),
                'is_active' => true,
            ]);
        }

        // Products
        $products = [];
        $productData = [
            ['name' => 'Leather Sofa', 'price' => 1299, 'category' => 0],
            ['name' => 'Dining Table', 'price' => 599, 'category' => 2],
            ['name' => 'Office Chair', 'price' => 299, 'category' => 1],
            ['name' => 'King Size Bed', 'price' => 899, 'category' => 3],
            ['name' => 'Bookshelf', 'price' => 249, 'category' => 4],
            ['name' => 'Coffee Table', 'price' => 349, 'category' => 2],
            ['name' => 'Armchair', 'price' => 449, 'category' => 1],
            ['name' => 'Wardrobe', 'price' => 799, 'category' => 3],
            ['name' => 'TV Stand', 'price' => 199, 'category' => 4],
            ['name' => 'Sectional Sofa', 'price' => 1899, 'category' => 0],
        ];
        foreach ($productData as $p) {
            $products[] = Product::create([
                'project_id' => $project->id,
                'product_category_id' => $productCategories[$p['category']]->id,
                'name' => $p['name'],
                'price' => $p['price'],
                'cost_price' => $p['price'] * 0.6,
                'unit' => 'pcs',
                'supplier_id' => $suppliers[array_rand($suppliers)]->id,
                'minimum_stock' => 2,
                'is_active' => true,
            ]);
        }

        // Stock movements (initial stock in)
        foreach ($products as $product) {
            StockMovement::create([
                'project_id' => $project->id,
                'product_id' => $product->id,
                'type' => 'in',
                'quantity' => rand(10, 50),
                'unit_cost' => $product->cost_price,
                'reference' => 'Initial stock',
                'reason' => 'Opening inventory',
                'user_id' => $owner->id,
            ]);
        }

        // Sales with items and payments
        $saleNumbers = ['FUR-001', 'FUR-002', 'FUR-003', 'FUR-004', 'FUR-005'];
        $sales = [];
        foreach ($saleNumbers as $i => $num) {
            $items = array_slice($products, $i * 2, 2);
            if (empty($items)) {
                $items = [$products[0], $products[1]];
            }
            $subtotal = 0;
            $saleItems = [];
            foreach ($items as $p) {
                $qty = rand(1, 3);
                $up = $p->price;
                $subtotal += $qty * $up;
                $saleItems[] = ['product' => $p, 'quantity' => $qty, 'unit_price' => $up];
            }
            $discount = $i === 0 ? 50 : 0;
            $total = $subtotal - $discount;

            $sale = Sale::create([
                'project_id' => $project->id,
                'sale_number' => $num,
                'status' => 'completed',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => 0,
                'total' => $total,
                'user_id' => $owner->id,
                'source' => $i < 2 ? 'pos' : 'manual',
            ]);

            foreach ($saleItems as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
                StockMovement::create([
                    'project_id' => $project->id,
                    'product_id' => $item['product']->id,
                    'sale_id' => $sale->id,
                    'type' => 'out',
                    'quantity' => -$item['quantity'],
                    'reference' => $num,
                    'user_id' => $owner->id,
                ]);
            }

            Payment::create([
                'project_id' => $project->id,
                'sale_id' => $sale->id,
                'payment_method' => ['cash', 'card', 'transfer'][$i % 3],
                'amount' => $total,
                'payment_date' => now()->subDays(rand(1, 30)),
                'user_id' => $owner->id,
                'status' => PaymentStatus::Paid,
            ]);

            $sales[] = $sale;
        }

        // Expense categories
        $expenseCategories = [];
        foreach (['Rent', 'Utilities', 'Supplies', 'Salaries', 'Marketing'] as $name) {
            $expenseCategories[] = ExpenseCategory::create([
                'project_id' => $project->id,
                'name' => $name,
                'color' => '#' . substr(md5($name), 0, 6),
                'is_active' => true,
            ]);
        }

        // Expenses
        foreach (range(1, 8) as $i) {
            Expense::create([
                'project_id' => $project->id,
                'expense_category_id' => $expenseCategories[array_rand($expenseCategories)]->id,
                'reference' => 'EXP-' . str_pad($i, 3, '0'),
                'description' => $faker->sentence(),
                'amount' => rand(100, 2000),
                'status' => $i <= 5 ? ExpenseStatus::Paid : ExpenseStatus::Pending,
                'expense_date' => now()->subDays(rand(1, 60)),
                'user_id' => $owner->id,
            ]);
        }

        // Tasks
        $taskTitles = ['Order new stock', 'Update catalog', 'Customer delivery', 'Quality check', 'Warehouse audit', 'Price update', 'Supplier meeting'];
        foreach ($taskTitles as $i => $title) {
            Task::create([
                'project_id' => $project->id,
                'title' => $title,
                'description' => $faker->sentence(),
                'status' => ['pending', 'in_progress', 'completed'][$i % 3],
                'priority' => ['low', 'medium', 'high'][$i % 3],
                'assignee_id' => $otherUsers->isEmpty() ? $owner->id : $otherUsers->random()->id,
                'created_by' => $owner->id,
                'due_date' => now()->addDays(rand(1, 14)),
            ]);
        }

        // Orders (purchase orders)
        foreach (range(1, 3) as $i) {
            $supplier = $suppliers[array_rand($suppliers)];
            $total = rand(500, 3000);
            Order::create([
                'project_id' => $project->id,
                'order_number' => 'PO-FUR-' . $project->id . '-' . str_pad($i, 3, '0'),
                'status' => ['pending', 'confirmed', 'completed'][$i - 1],
                'supplier_id' => $supplier->id,
                'user_id' => $owner->id,
                'subtotal' => $total,
                'tax' => 0,
                'total' => $total,
                'ordered_at' => now()->subDays(rand(5, 30)),
                'received_at' => $i > 1 ? now()->subDays(rand(1, 10)) : null,
            ]);
        }

        // POS session and order
        $posSession = PosSession::create([
            'project_id' => $project->id,
            'session_number' => 'POS-FUR-' . $project->id . '-' . time(),
            'user_id' => $owner->id,
            'opening_cash' => 500,
            'closing_cash' => 1250,
            'status' => 'closed',
            'opened_at' => now()->subDay(),
            'closed_at' => now()->subHours(2),
        ]);

        $posProducts = array_slice($products, 0, 3);
        $posSubtotal = 0;
        foreach ($posProducts as $p) {
            $posSubtotal += $p->price * 2;
        }
        $posOrder = PosOrder::create([
            'project_id' => $project->id,
            'pos_session_id' => $posSession->id,
            'sale_id' => $sales[0]->id,
            'order_number' => 'ORD-001',
            'status' => 'completed',
            'subtotal' => $posSubtotal,
            'discount' => 0,
            'tax' => 0,
            'total' => $posSubtotal,
            'user_id' => $owner->id,
        ]);

        foreach ($posProducts as $p) {
            PosOrderItem::create([
                'pos_order_id' => $posOrder->id,
                'product_id' => $p->id,
                'quantity' => 2,
                'unit_price' => $p->price,
                'total' => $p->price * 2,
            ]);
        }

        PosPayment::create([
            'project_id' => $project->id,
            'pos_order_id' => $posOrder->id,
            'payment_method' => 'cash',
            'amount' => $posSubtotal,
            'user_id' => $owner->id,
        ]);

        // Activity logs
        $firstExpense = Expense::where('project_id', $project->id)->first();
        $firstPayment = Payment::where('project_id', $project->id)->first();
        $loggables = array_filter([
            ['type' => Product::class, 'id' => $products[0]->id],
            ['type' => Sale::class, 'id' => $sales[0]->id],
            $firstExpense ? ['type' => Expense::class, 'id' => $firstExpense->id] : null,
            $firstPayment ? ['type' => Payment::class, 'id' => $firstPayment->id] : null,
        ]);
        $actions = ['created', 'updated'];
        foreach (range(1, 12) as $i) {
            $lg = $loggables[array_rand($loggables)];
            ActivityLog::create([
                'project_id' => $project->id,
                'user_id' => $owner->id,
                'action' => $actions[array_rand($actions)],
                'loggable_type' => $lg['type'],
                'loggable_id' => $lg['id'],
                'module' => ['products', 'sales', 'expenses', 'payments', 'stock'][array_rand(['products', 'sales', 'expenses', 'payments', 'stock'])],
                'description' => $faker->sentence(),
            ]);
        }
    }
}
