<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ModuleSeeder::class,
            UserSeeder::class,
            ProjectSeeder::class,
            ProjectUserSeeder::class,
            ProjectModuleSeeder::class,
            SupplierSeeder::class,
            ProductSeeder::class,
            TaskSeeder::class,
            ActivityLogSeeder::class,
            FurnitureProjectSeeder::class,
        ]);
    }
}
