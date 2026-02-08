<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectUser;
use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $kpis = [
            ['key' => 'users', 'label' => 'Users', 'value' => User::count()],
            ['key' => 'projects', 'label' => 'Projects', 'value' => Project::count()],
            ['key' => 'assignments', 'label' => 'Assignments', 'value' => ProjectUser::count()],
            ['key' => 'roles', 'label' => 'Roles', 'value' => Role::count()],
        ];

        $alerts = [];
        $projectsWithoutModules = Project::whereDoesntHave('projectModules', fn ($q) => $q->where('is_enabled', true))->count();
        if ($projectsWithoutModules > 0) {
            $alerts[] = [
                'key' => 'projects_no_modules',
                'severity' => 'warning',
                'message' => $projectsWithoutModules . ' project(s) have no modules enabled.',
                'href' => route('admin.modules.index'),
            ];
        }

        $quickActions = [
            ['key' => 'add_user', 'label' => 'Add user', 'href' => route('admin.users.create'), 'icon' => 'users'],
            ['key' => 'manage_assignments', 'label' => 'Assign workers', 'href' => route('admin.workers.index'), 'icon' => 'workers'],
            ['key' => 'configure_modules', 'label' => 'Configure modules', 'href' => route('admin.modules.index'), 'icon' => 'modules'],
        ];

        $projects = Project::orderBy('name')->get(['id', 'name', 'primary_color', 'secondary_color']);

        return Inertia::render('Admin/Dashboard', [
            'kpis' => $kpis,
            'alerts' => $alerts,
            'quickActions' => $quickActions,
            'projects' => $projects,
        ]);
    }
}
