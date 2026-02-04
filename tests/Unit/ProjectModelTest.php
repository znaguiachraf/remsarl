<?php

namespace Tests\Unit;

use App\Models\Module;
use App\Models\Project;
use App\Models\ProjectModule;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([\Database\Seeders\RoleSeeder::class, \Database\Seeders\ModuleSeeder::class]);
    }

    public function test_project_belongs_to_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->assertEquals($user->id, $project->owner->id);
    }

    public function test_project_has_many_users_through_project_user(): void
    {
        $project = Project::factory()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $role = Role::where('slug', 'member')->first();

        $project->users()->attach($user1->id, ['role_id' => $role->id, 'status' => 'active']);
        $project->users()->attach($user2->id, ['role_id' => $role->id, 'status' => 'active']);

        $this->assertCount(2, $project->users);
    }

    public function test_project_has_module_check(): void
    {
        $project = Project::factory()->create();
        ProjectModule::create([
            'project_id' => $project->id,
            'module_key' => 'pos',
            'is_enabled' => true,
        ]);

        $this->assertTrue($project->hasModule('pos'));
        $this->assertFalse($project->hasModule('tasks'));
    }

    public function test_user_has_project_access(): void
    {
        $project = Project::factory()->create();
        $user = User::factory()->create();
        $role = Role::where('slug', 'member')->first();
        $project->users()->attach($user->id, ['role_id' => $role->id, 'status' => 'active']);

        $this->assertTrue($user->hasProjectAccess($project));
    }

    public function test_user_is_owner_of_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->assertTrue($user->isOwnerOf($project));
    }

    public function test_module_is_enabled_for_project(): void
    {
        $module = Module::where('key', 'pos')->first();
        $project = Project::factory()->create();
        ProjectModule::create([
            'project_id' => $project->id,
            'module_key' => 'pos',
            'is_enabled' => true,
        ]);

        $this->assertTrue($module->isEnabledForProject($project));
    }

    public function test_project_module_get_config(): void
    {
        $project = Project::factory()->create();
        $pm = ProjectModule::create([
            'project_id' => $project->id,
            'module_key' => 'pos',
            'config' => ['setting' => 'value'],
            'is_enabled' => true,
        ]);

        $this->assertEquals('value', $pm->getConfig('setting'));
        $this->assertEquals('default', $pm->getConfig('missing', 'default'));
    }
}
