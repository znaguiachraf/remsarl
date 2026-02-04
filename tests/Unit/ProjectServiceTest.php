<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([\Database\Seeders\RoleSeeder::class, \Database\Seeders\ModuleSeeder::class]);
        $this->service = app(ProjectService::class);
    }

    public function test_create_project_assigns_owner(): void
    {
        $user = User::factory()->create();
        $project = $this->service->create(['name' => 'New Project'], $user);

        $this->assertEquals($user->id, $project->owner_id);
        $this->assertCount(1, $project->users);
        $this->assertEquals($user->id, $project->users->first()->id);
    }

    public function test_set_enabled_modules_replaces_existing(): void
    {
        $user = User::factory()->create();
        $project = $this->service->create(['name' => 'Project'], $user);
        $this->service->enableModule($project, 'pos');
        $this->service->enableModule($project, 'tasks');

        $this->service->setEnabledModules($project, ['products', 'sales']);

        $enabled = $project->fresh()->projectModules()->where('is_enabled', true)->pluck('module_key')->toArray();
        $this->assertEqualsCanonicalizing(['products', 'sales'], $enabled);
    }

    public function test_update_user_role(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = $this->service->create(['name' => 'Project'], $owner);
        $memberRole = Role::where('slug', 'member')->first();
        $adminRole = Role::where('slug', 'admin')->first();

        $this->service->assignUser($project, $member, $memberRole);
        $this->service->updateUserRole($project, $member, $adminRole);

        $membership = $project->users()->where('user_id', $member->id)->first();
        $this->assertEquals($adminRole->id, $membership->pivot->role_id);
    }
}
