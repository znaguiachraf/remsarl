<?php

namespace Tests\Unit;

use App\Models\Module;
use App\Models\Project;
use App\Models\ProjectModule;
use App\Services\ModuleService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ModuleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([\Database\Seeders\RoleSeeder::class, \Database\Seeders\ModuleSeeder::class]);
        $this->service = app(ModuleService::class);
    }

    public function test_get_available_modules_returns_active_modules(): void
    {
        $modules = $this->service->getAvailableModules();

        $this->assertGreaterThan(0, $modules->count());
        $this->assertTrue($modules->every(fn ($m) => $m->is_active));
        $keys = $modules->pluck('key')->toArray();
        $this->assertContains('pos', $keys);
        $this->assertContains('products', $keys);
    }

    public function test_is_module_enabled_returns_true_when_enabled(): void
    {
        $project = Project::factory()->create();
        ProjectModule::create([
            'project_id' => $project->id,
            'module_key' => 'pos',
            'is_enabled' => true,
        ]);

        $this->assertTrue($this->service->isModuleEnabled($project, 'pos'));
    }

    public function test_is_module_enabled_returns_false_when_disabled(): void
    {
        $project = Project::factory()->create();

        $this->assertFalse($this->service->isModuleEnabled($project, 'pos'));
    }

    public function test_get_enabled_module_keys(): void
    {
        $project = Project::factory()->create();
        ProjectModule::create(['project_id' => $project->id, 'module_key' => 'pos', 'is_enabled' => true]);
        ProjectModule::create(['project_id' => $project->id, 'module_key' => 'tasks', 'is_enabled' => true]);

        $keys = $this->service->getEnabledModuleKeys($project);

        $this->assertEqualsCanonicalizing(['pos', 'tasks'], $keys);
    }

    public function test_ensure_module_enabled_throws_when_disabled(): void
    {
        $project = Project::factory()->create();

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Module [pos] is not enabled for this project');

        $this->service->ensureModuleEnabled($project, 'pos');
    }

    public function test_ensure_module_enabled_passes_when_enabled(): void
    {
        $project = Project::factory()->create();
        ProjectModule::create(['project_id' => $project->id, 'module_key' => 'pos', 'is_enabled' => true]);

        $this->service->ensureModuleEnabled($project, 'pos');

        $this->addToAssertionCount(1); // No exception thrown
    }
}
