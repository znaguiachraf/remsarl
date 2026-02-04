<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToProject
{
    /**
     * Ensure the authenticated user belongs to and has access to the project.
     * Must run after auth middleware.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $project = $request->route('project');

        if (!$project instanceof Project) {
            abort(404, 'Project not found.');
        }

        if (!$request->user()) {
            return redirect()->route('login');
        }

        if (!$request->user()->hasProjectAccess($project) && !$request->user()->isAdmin()) {
            abort(403, 'You do not have access to this project.');
        }

        return $next($request);
    }
}
