<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use App\Policies\ProjectPolicy;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([\Database\Seeders\RoleSeeder::class, \Database\Seeders\ModuleSeeder::class]);
        $this->policy = new ProjectPolicy;
    }

    public function test_owner_can_view_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $project->users()->attach($user->id, [
            'role_id' => Role::where('slug', 'owner')->first()->id,
            'status' => 'active',
        ]);

        $this->assertTrue($this->policy->view($user, $project));
    }

    public function test_member_with_access_can_view_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->users()->attach($member->id, [
            'role_id' => Role::where('slug', 'member')->first()->id,
            'status' => 'active',
        ]);

        $this->assertTrue($this->policy->view($member, $project));
    }

    public function test_user_without_access_cannot_view_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();

        $this->assertFalse($this->policy->view($user, $project));
    }

    public function test_owner_can_update_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->assertTrue($this->policy->update($user, $project));
    }

    public function test_owner_can_delete_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->assertTrue($this->policy->delete($user, $project));
    }

    public function test_non_owner_cannot_delete_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->users()->attach($member->id, [
            'role_id' => Role::where('slug', 'admin')->first()->id,
            'status' => 'active',
        ]);

        $this->assertFalse($this->policy->delete($member, $project));
    }

    public function test_owner_can_manage_members(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->assertTrue($this->policy->manageMembers($user, $project));
    }

    public function test_owner_can_manage_modules(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->assertTrue($this->policy->manageModules($user, $project));
    }
}
