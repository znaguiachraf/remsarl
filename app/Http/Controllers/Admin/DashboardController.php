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
        $stats = [
            'users' => User::count(),
            'projects' => Project::count(),
            'assignments' => ProjectUser::count(),
            'roles' => Role::count(),
        ];

        $projects = Project::orderBy('name')->get(['id', 'name', 'primary_color', 'secondary_color']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'projects' => $projects,
        ]);
    }
}
