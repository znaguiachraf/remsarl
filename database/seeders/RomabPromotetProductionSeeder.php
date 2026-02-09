<?php

namespace Database\Seeders;

use App\Enums\ExpenseStatus;
use App\Enums\ProjectStatus;
use App\Enums\UserProjectStatus;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Module;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use App\Models\ProjectModule;
use App\Models\Role;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class RomabPromotetProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->truncateProjectData();

        $owner = User::first();
        if (!$owner) {
            $this->command->warn('No users found. Run UserSeeder first.');

            return;
        }

        $projects = [
            [
                'name' => 'Romab',
                'slug' => 'romab',
                'type' => 'import_export',
                'description' => 'Import/Export company',
                'city' => 'Casablanca',
                'country' => 'Morocco',
                'address' => 'Avenue Mohammed V, Casablanca',
                'phone' => '+212 522 000000',
                'primary_color' => '#2563EB',
                'secondary_color' => '#059669',
                'categories' => [
                    ['name' => 'Electronics', 'color' => '#3B82F6'],
                    ['name' => 'Textiles', 'color' => '#8B5CF6'],
                    ['name' => 'Machinery', 'color' => '#6366F1'],
                    ['name' => 'Food Products', 'color' => '#10B981'],
                ],
                'products' => [
                    ['name' => 'Smartphones', 'price' => 3500, 'category' => 0],
                    ['name' => 'Laptops', 'price' => 8999, 'category' => 0],
                    ['name' => 'Cotton Fabric', 'price' => 85, 'category' => 1],
                    ['name' => 'Industrial Machine', 'price' => 45000, 'category' => 2],
                    ['name' => 'Olive Oil', 'price' => 120, 'category' => 3],
                    ['name' => 'Canned Sardines', 'price' => 45, 'category' => 3],
                    ['name' => 'LED TV', 'price' => 4999, 'category' => 0],
                    ['name' => 'Wool Yarn', 'price' => 150, 'category' => 1],
                    ['name' => 'Conveyor Belt', 'price' => 12500, 'category' => 2],
                ],
                'suppliers' => ['Global Imports SARL', 'Tech Distribution Maroc', 'Textile Plus Casablanca'],
            ],
            [
                'name' => 'Promotet',
                'slug' => 'promotet',
                'type' => 'real_estate',
                'description' => 'Real estate company',
                'city' => 'Rabat',
                'country' => 'Morocco',
                'address' => 'Avenue Mohammed VI, Rabat',
                'phone' => '+212 537 000000',
                'primary_color' => '#7C3AED',
                'secondary_color' => '#0EA5E9',
                'categories' => [
                    ['name' => 'Apartments', 'color' => '#7C3AED'],
                    ['name' => 'Villas', 'color' => '#6366F1'],
                    ['name' => 'Land', 'color' => '#10B981'],
                    ['name' => 'Commercial', 'color' => '#F59E0B'],
                ],
                'products' => [
                    ['name' => 'Studio Apartment', 'price' => 450000, 'category' => 0],
                    ['name' => '2-Bedroom Apartment', 'price' => 750000, 'category' => 0],
                    ['name' => 'Luxury Villa', 'price' => 3500000, 'category' => 1],
                    ['name' => 'Building Plot', 'price' => 1200000, 'category' => 2],
                    ['name' => 'Office Space', 'price' => 1800000, 'category' => 3],
                    ['name' => 'Penthouse', 'price' => 2200000, 'category' => 0],
                    ['name' => 'Duplex', 'price' => 950000, 'category' => 0],
                    ['name' => 'Beach Villa', 'price' => 4800000, 'category' => 1],
                    ['name' => 'Agricultural Land', 'price' => 350000, 'category' => 2],
                ],
                'suppliers' => ['Promotet Construction', 'Rabat Properties', 'Agence Immobilière Premium'],
            ],
            [
                'name' => 'Meubles el Mourabet',
                'slug' => 'meubles-el-mourabet',
                'type' => 'furniture',
                'description' => 'Furniture Store',
                'city' => 'Tangier',
                'country' => 'Morocco',
                'address' => 'Boulevard Pasteur, Tangier',
                'phone' => '+212 539 000000',
                'primary_color' => '#8B4513',
                'secondary_color' => '#D2691E',
                'categories' => [
                    ['name' => 'Sofas', 'color' => '#8B4513'],
                    ['name' => 'Chairs', 'color' => '#A0522D'],
                    ['name' => 'Tables', 'color' => '#CD853F'],
                    ['name' => 'Beds', 'color' => '#D2691E'],
                    ['name' => 'Shelves', 'color' => '#BC8F8F'],
                ],
                'products' => [
                    ['name' => 'Canapé en cuir', 'price' => 12999, 'category' => 0],
                    ['name' => 'Table à manger', 'price' => 5999, 'category' => 2],
                    ['name' => 'Chaise bureau', 'price' => 2999, 'category' => 1],
                    ['name' => 'Lit king size', 'price' => 8999, 'category' => 3],
                    ['name' => 'Étagère', 'price' => 2499, 'category' => 4],
                    ['name' => 'Table basse', 'price' => 3499, 'category' => 2],
                    ['name' => 'Fauteuil', 'price' => 4499, 'category' => 1],
                    ['name' => 'Armoire', 'price' => 7999, 'category' => 3],
                    ['name' => 'Meuble TV', 'price' => 1999, 'category' => 4],
                    ['name' => 'Canapé d\'angle', 'price' => 18999, 'category' => 0],
                ],
                'suppliers' => ['Bois Premium Tangier', 'Meubles Moderne Maroc', 'Fournitures Classiques'],
            ],
        ];

        $ownerRole = Role::where('slug', 'owner')->first();
        $memberRole = Role::where('slug', 'member')->first();
        $moduleKeys = Module::where('is_active', true)->pluck('key')->toArray();

        foreach ($projects as $data) {
            $project = Project::create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'type' => $data['type'],
                'description' => $data['description'],
                'city' => $data['city'],
                'country' => $data['country'],
                'address' => $data['address'],
                'phone' => $data['phone'],
                'primary_color' => $data['primary_color'],
                'secondary_color' => $data['secondary_color'],
                'status' => ProjectStatus::Active,
                'owner_id' => $owner->id,
            ]);

            $project->users()->attach($owner->id, [
                'role_id' => $ownerRole?->id ?? $memberRole?->id,
                'status' => UserProjectStatus::Active,
                'joined_at' => now(),
            ]);

            foreach ($moduleKeys as $key) {
                ProjectModule::create([
                    'project_id' => $project->id,
                    'module_key' => $key,
                    'config' => [],
                    'is_enabled' => true,
                ]);
            }

            $productCategories = [];
            foreach ($data['categories'] as $c) {
                $productCategories[] = ProductCategory::create([
                    'project_id' => $project->id,
                    'name' => $c['name'],
                    'color' => $c['color'],
                    'description' => "{$c['name']} category",
                    'is_active' => true,
                ]);
            }

            $suppliers = [];
            foreach ($data['suppliers'] as $i => $name) {
                $suppliers[] = Supplier::create([
                    'project_id' => $project->id,
                    'name' => $name,
                    'contact_person' => "Contact {$name}",
                    'email' => strtolower(str_replace(' ', '', $name)) . '@example.ma',
                    'phone' => '+212 5' . ($i + 2) . ' 000000',
                    'address' => $data['address'],
                    'is_active' => true,
                ]);
            }

            $products = [];
            foreach ($data['products'] as $p) {
                $products[] = Product::create([
                    'project_id' => $project->id,
                    'product_category_id' => $productCategories[$p['category']]->id,
                    'name' => $p['name'],
                    'price' => $p['price'],
                    'cost_price' => $p['price'] * 0.6,
                    'unit' => in_array($data['type'], ['real_estate']) ? 'unit' : 'pcs',
                    'supplier_id' => $suppliers[array_rand($suppliers)]->id,
                    'minimum_stock' => $data['type'] === 'furniture' ? 2 : 0,
                    'is_active' => true,
                ]);
            }

            if ($data['type'] !== 'real_estate') {
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
            }

            $expenseCategories = [];
            foreach (['Loyer', 'Utilities', 'Fournitures', 'Salaires', 'Marketing'] as $name) {
                $expenseCategories[] = ExpenseCategory::create([
                    'project_id' => $project->id,
                    'name' => $name,
                    'color' => '#' . substr(md5($name), 0, 6),
                    'is_active' => true,
                ]);
            }

            foreach (range(1, 4) as $i) {
                Expense::create([
                    'project_id' => $project->id,
                    'expense_category_id' => $expenseCategories[array_rand($expenseCategories)]->id,
                    'reference' => 'EXP-' . str_pad($i, 3, '0'),
                    'description' => "Dépense {$data['name']} #{$i}",
                    'amount' => rand(500, 3000),
                    'status' => $i <= 2 ? ExpenseStatus::Paid : ExpenseStatus::Pending,
                    'expense_date' => now()->subDays(rand(1, 30)),
                    'user_id' => $owner->id,
                ]);
            }

            $this->command->info("Created project: {$project->name}");
        }
    }

    protected function truncateProjectData(): void
    {
        $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = OFF');
        }

        $tables = [
            'activity_logs',
            'invoices',
            'pos_payments',
            'pos_order_items',
            'pos_orders',
            'payments',
            'stock_movements',
            'sale_items',
            'sales',
            'expenses',
            'tasks',
            'purchase_order_items',
            'purchase_orders',
            'orders',
            'products',
            'product_categories',
            'expense_categories',
            'suppliers',
            'attendances',
            'salaries',
            'cnss_records',
            'contracts',
            'vacations',
            'workers',
            'employee_notes',
            'locations',
            'project_modules',
            'project_user',
            'projects',
        ];

        foreach ($tables as $table) {
            if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                \Illuminate\Support\Facades\DB::table($table)->truncate();
            }
        }

        if ($driver === 'mysql') {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = ON');
        }
    }
}
