<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectService $projectService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([\Database\Seeders\RoleSeeder::class, \Database\Seeders\ModuleSeeder::class]);
        $this->projectService = app(ProjectService::class);
    }

    public function test_user_can_create_project(): void
    {
        $user = User::factory()->create();

        $project = $this->projectService->create([
            'name' => 'Test Business',
            'description' => 'A test project',
            'city' => 'New York',
            'country' => 'USA',
        ], $user);

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Business',
            'owner_id' => $user->id,
        ]);
        $this->assertEquals('test-business', $project->slug);
        $this->assertEquals(ProjectStatus::Active, $project->status);
    }

    public function test_project_owner_is_assigned_on_creation(): void
    {
        $user = User::factory()->create();
        $project = $this->projectService->create(['name' => 'My Business'], $user);

        $this->assertTrue($user->hasProjectAccess($project));
        $this->assertTrue($user->isOwnerOf($project));

        $ownerRole = Role::where('slug', 'owner')->first();
        $this->assertNotNull($ownerRole);
        $membership = $project->users()->where('user_id', $user->id)->first();
        $this->assertNotNull($membership);
        $this->assertEquals($ownerRole->id, $membership->pivot->role_id);
    }

    public function test_user_can_update_project(): void
    {
        $user = User::factory()->create();
        $project = $this->projectService->create(['name' => 'Original Name'], $user);

        $updated = $this->projectService->update($project, [
            'name' => 'Updated Name',
            'primary_color' => '#FF0000',
        ]);

        $this->assertEquals('Updated Name', $updated->name);
        $this->assertEquals('#FF0000', $updated->primary_color);
    }

    public function test_user_can_assign_worker_to_project(): void
    {
        $owner = User::factory()->create();
        $worker = User::factory()->create();
        $project = $this->projectService->create(['name' => 'Test Project'], $owner);

        $memberRole = Role::where('slug', 'member')->first();
        $this->projectService->assignUser($project, $worker, $memberRole);

        $this->assertTrue($project->users()->where('user_id', $worker->id)->exists());
        $membership = $project->users()->where('user_id', $worker->id)->first();
        $this->assertEquals($memberRole->id, $membership->pivot->role_id);
    }

    public function test_user_can_remove_worker_from_project(): void
    {
        $owner = User::factory()->create();
        $worker = User::factory()->create();
        $project = $this->projectService->create(['name' => 'Test Project'], $owner);

        $memberRole = Role::where('slug', 'member')->first();
        $this->projectService->assignUser($project, $worker, $memberRole);
        $this->assertTrue($project->users()->where('user_id', $worker->id)->exists());

        $removed = $this->projectService->removeUser($project, $worker);
        $this->assertTrue($removed);
        $this->assertFalse($project->users()->where('user_id', $worker->id)->exists());
    }

    public function test_user_can_enable_module_for_project(): void
    {
        $user = User::factory()->create();
        $project = $this->projectService->create(['name' => 'Test Project'], $user);

        $projectModule = $this->projectService->enableModule($project, 'pos', ['config_key' => 'value']);

        $this->assertTrue($project->hasModule('pos'));
        $this->assertEquals(['config_key' => 'value'], $projectModule->config);
    }

    public function test_user_can_disable_module_for_project(): void
    {
        $user = User::factory()->create();
        $project = $this->projectService->create(['name' => 'Test Project'], $user);
        $this->projectService->enableModule($project, 'tasks');

        $disabled = $this->projectService->disableModule($project, 'tasks');

        $this->assertTrue($disabled);
        $this->assertFalse($project->fresh()->hasModule('tasks'));
    }

    public function test_project_slug_is_auto_generated(): void
    {
        $user = User::factory()->create();
        $project = $this->projectService->create(['name' => 'My Company Inc'], $user);

        $this->assertEquals('my-company-inc', $project->slug);
    }
}
