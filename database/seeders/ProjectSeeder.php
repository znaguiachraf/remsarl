<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::first();

        if (!$owner) {
            return;
        }

        Project::factory()->create([
            'name' => 'Demo Store',
            'slug' => 'demo-store',
            'primary_color' => '#3B82F6',
            'secondary_color' => '#10B981',
            'address' => '123 Main Street, Downtown',
            'phone' => '+1 555 123 4567',
            'description' => 'A sample retail project for demonstration.',
            'city' => 'New York',
            'country' => 'USA',
            'status' => ProjectStatus::Active,
            'owner_id' => $owner->id,
        ]);

        Project::factory()->create([
            'name' => 'Tech Solutions Inc',
            'slug' => 'tech-solutions-inc',
            'primary_color' => '#8B5CF6',
            'secondary_color' => '#06B6D4',
            'description' => 'Technology consulting and services.',
            'city' => 'San Francisco',
            'country' => 'USA',
            'status' => ProjectStatus::Active,
            'owner_id' => $owner->id,
        ]);

        Project::factory()->create([
            'name' => 'Archived Project',
            'slug' => 'archived-project',
            'status' => ProjectStatus::Archived,
            'owner_id' => $owner->id,
        ]);
    }
}
