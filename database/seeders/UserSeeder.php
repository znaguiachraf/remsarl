<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'is_admin' => true,
        ]);

        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
        ]);

        User::factory()->create([
            'name' => 'Member User',
            'email' => 'member@example.com',
        ]);

        User::factory()->count(5)->create();
    }
}
