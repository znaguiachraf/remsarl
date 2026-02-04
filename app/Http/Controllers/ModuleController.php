<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * Placeholder for enabled modules. Each module can override with its own page.
     */
    public function __invoke(Project $project, Request $request): Response
    {
        $moduleKey = $request->route('module') ?? 'unknown';

        return Inertia::render('Modules/Placeholder', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'moduleKey' => $moduleKey,
            'moduleName' => ucfirst(str_replace('-', ' ', $moduleKey)),
        ]);
    }
}
