<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [ActivityLog::class, $project]);

        $projectId = $project->id;

        $query = ActivityLog::where('project_id', $projectId)
            ->with('user')
            ->orderByDesc('created_at');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('loggable_type')) {
            $query->where('loggable_type', $request->loggable_type);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        $logs = $query->paginate($request->get('per_page', 20))->withQueryString();

        $users = ActivityLog::where('project_id', $projectId)
            ->whereNotNull('user_id')
            ->join('users', 'activity_logs.user_id', '=', 'users.id')
            ->select('users.id', 'users.name')
            ->distinct()
            ->orderBy('users.name')
            ->get();

        $entityTypes = ActivityLog::where('project_id', $projectId)
            ->whereNotNull('loggable_type')
            ->select('loggable_type')
            ->distinct()
            ->orderBy('loggable_type')
            ->pluck('loggable_type');

        $actions = ActivityLog::where('project_id', $projectId)
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('Logs/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'logs' => [
                'data' => $logs->map(fn ($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'loggable_type' => $this->formatEntityType($log->loggable_type),
                    'loggable_id' => $log->loggable_id,
                    'loggable_type_raw' => $log->loggable_type,
                    'description' => $log->description,
                    'module' => $log->module,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'ip_address' => $log->ip_address,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                    ] : null,
                    'created_at' => $log->created_at->toISOString(),
                    'created_at_human' => $log->created_at->diffForHumans(),
                ]),
                'links' => $logs->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
            ],
            'filters' => [
                'user_id' => $request->user_id,
                'loggable_type' => $request->loggable_type,
                'action' => $request->action,
                'from_date' => $request->from_date,
                'to_date' => $request->to_date,
            ],
            'filterOptions' => [
                'users' => $users->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])->values()->toArray(),
                'entity_types' => $entityTypes->map(fn ($t) => ['value' => $t, 'label' => $this->formatEntityType($t)])->values()->toArray(),
                'actions' => $actions->values()->toArray(),
            ],
        ]);
    }

    protected function formatEntityType(?string $type): string
    {
        if (!$type) {
            return '—';
        }
        $parts = explode('\\', $type);

        return class_basename($type);
    }
}
