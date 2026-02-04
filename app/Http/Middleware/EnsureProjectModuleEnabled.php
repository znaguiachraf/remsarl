<?php

namespace App\Http\Middleware;

use App\Models\Project;
use App\Services\ModuleService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProjectModuleEnabled
{
    public function __construct(
        protected ModuleService $moduleService
    ) {}

    /**
     * @param  \Closure(Request): (Response)  $next
     * @param  string|null  $moduleKey  Optional static module key; otherwise uses route param 'module'
     */
    public function handle(Request $request, Closure $next, ?string $moduleKey = null): Response
    {
        $project = $request->route('project');
        $moduleKey = $moduleKey ?? $request->route('module');

        if (!$project instanceof Project) {
            abort(404, 'Project not found.');
        }

        if (!$moduleKey) {
            abort(404, 'Module not specified.');
        }

        $this->moduleService->ensureModuleEnabled($project, $moduleKey);

        return $next($request);
    }
}
