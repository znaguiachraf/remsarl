<?php

namespace App\Http\Middleware;

use App\Enums\PaymentMethod;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\ProjectModule;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $project = $this->resolveCurrentProject($request);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'email_verified_at' => $request->user()->email_verified_at?->toISOString(),
                    'is_admin' => $request->user()->is_admin ?? false,
                ] : null,
            ],
            'auth_error' => fn () => $request->session()->get('auth_error'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'currentProject' => $project ? $this->projectToArray($project, $request) : null,
            'enabledModules' => $project ? $this->getEnabledModules($project) : [],
            'userRole' => $project && $request->user() ? $this->getUserRole($project, $request->user()) : null,
            'sidebar' => $project && $request->user() ? $this->getSidebarVisibility($project, $request->user()) : null,
            'userProjects' => $request->user() ? $this->getUserProjects($request->user()) : [],
            'notificationCounts' => $project ? $this->getNotificationCounts($project) : [],
            'payment_methods' => array_map(fn ($v) => ['value' => $v, 'label' => PaymentMethod::from($v)->label()], PaymentMethod::values()),
        ];
    }

    protected function getNotificationCounts(Project $project): array
    {
        $tasksCount = 0;
        if ($project->hasModule('tasks')) {
            $tasksCount = Task::forProject($project)
                ->where('status', TaskStatus::Pending)
                ->count();
        }

        return [
            'tasks' => $tasksCount,
        ];
    }

    protected function resolveCurrentProject(Request $request): ?Project
    {
        $route = $request->route();

        if (!$route) {
            return null;
        }

        $project = $route->parameter('project');

        if ($project instanceof Project) {
            return $project;
        }

        if (is_numeric($project)) {
            return Project::find($project);
        }

        return null;
    }

    protected function projectToArray(Project $project, Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $project->id,
            'name' => $project->name,
            'slug' => $project->slug,
            'logo' => $project->logo_url,
            'primary_color' => $project->primary_color,
            'secondary_color' => $project->secondary_color,
            'status' => $project->status->value,
            'status_label' => $project->status->label(),
            'can_update' => $user?->can('update', $project) ?? false,
        ];
    }

    protected function getEnabledModules(Project $project): array
    {
        return ProjectModule::where('project_id', $project->id)
            ->where('is_enabled', true)
            ->with('module')
            ->get()
            ->map(fn ($pm) => [
                'key' => $pm->module_key,
                'name' => $pm->module?->name ?? $pm->module_key,
                'icon' => $pm->module?->icon ?? 'folder',
            ])
            ->values()
            ->toArray();
    }

    protected function getUserRole(Project $project, $user): ?array
    {
        $membership = $project->users()->where('user_id', $user->id)->wherePivot('status', 'active')->first();

        if (!$membership) {
            return null;
        }

        $role = $membership->role;

        return $role ? [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'permissions' => $role->permissions()->pluck('slug')->values()->toArray(),
        ] : null;
    }

    /**
     * Module key => permission slugs (user needs any one to see the module).
     * Single source of truth for sidebar visibility; add new modules/permissions here.
     */
    protected function getModulePermissionSlugs(): array
    {
        return [
            'hr' => ['worker.view'],
            'tasks' => ['task.view', 'tasks.access'],
            'suppliers' => ['supplier.view'],
            'products' => ['product.view'],
            'sales' => ['sale.view'],
            'stock' => ['stock.view'],
            'pos' => ['pos.access'],
            'payments' => ['payment.view'],
            'expenses' => ['expense.view'],
            'purchase' => ['purchase.view'],
            'logs' => ['log.view'],
            // analytics: no permission required (any project member with module enabled can see)
        ];
    }

    /**
     * Sidebar visibility computed from the user's role permissions.
     * Platform admins see everything; others see only what their role allows.
     */
    protected function getSidebarVisibility(Project $project, $user): array
    {
        $isAdmin = $user->isAdmin();
        $enabledModules = $this->getEnabledModules($project);
        $modulePermissionSlugs = $this->getModulePermissionSlugs();
        $userPermissionSlugs = [];

        if (!$isAdmin) {
            $role = $user->roleOnProject($project);
            if ($role) {
                $userPermissionSlugs = $role->permissions()->pluck('slug')->values()->all();
            }
        }

        $hasPermission = function (string $slug) use ($isAdmin, $userPermissionSlugs): bool {
            return $isAdmin || in_array($slug, $userPermissionSlugs, true);
        };

        $visibleModules = [];
        foreach ($enabledModules as $module) {
            $required = $modulePermissionSlugs[$module['key']] ?? null;
            if ($required === null) {
                $visibleModules[] = $module;
                continue;
            }
            foreach ($required as $slug) {
                if ($hasPermission($slug)) {
                    $visibleModules[] = $module;
                    break;
                }
            }
        }

        return [
            'visibleModules' => $visibleModules,
            'canSeeNotes' => $hasPermission('worker.view'),
            'canSeeWorkers' => $hasPermission('worker.view'),
            'canSeeRoles' => $hasPermission('projects.manage-members'),
        ];
    }

    protected function getUserProjects($user): array
    {
        return $user->projects()
            ->wherePivot('status', 'active')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'logo' => $p->logo_url,
            ])
            ->toArray();
    }
}
