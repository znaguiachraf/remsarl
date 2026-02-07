<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\Worker;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Task::class, $project]);

        $user = $request->user();
        $canManageAllTasks = $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('task.assign') ?? false);

        $filters = [
            'worker_id' => $request->get('worker_id'),
            'status' => $request->get('status'),
            'search' => $request->get('search'),
            'date_day' => $request->get('date_day'),
            'date_month' => $request->get('date_month'),
            'per_page' => $request->get('per_page', 15),
        ];

        if (!$canManageAllTasks) {
            $worker = Worker::forProject($project)->where('user_id', $user->id)->first();
            if ($worker) {
                $filters['worker_id'] = (string) $worker->id;
            } else {
                $filters['worker_id'] = 'none';
            }
        }

        $tasks = $this->taskService->list($project, $filters);

        $workers = Worker::forProject($project)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn ($w) => ['id' => $w->id, 'full_name' => $w->full_name]);

        return Inertia::render('Tasks/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'tasks' => [
                'data' => $tasks->map(fn ($t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                    'description' => $t->description,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'worker' => $t->worker ? ['id' => $t->worker->id, 'full_name' => $t->worker->full_name] : null,
                    'created_at' => $t->created_at->format('Y-m-d H:i'),
                    'completed_at' => $t->completed_at?->format('Y-m-d H:i'),
                    'can_complete' => $user->can('complete', $t),
                    'can_delete' => $user->can('delete', $t),
                ]),
                'links' => $tasks->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $tasks->currentPage(),
                    'last_page' => $tasks->lastPage(),
                    'per_page' => $tasks->perPage(),
                    'total' => $tasks->total(),
                ],
            ],
            'workers' => $workers,
            'filters' => [
                'worker_id' => $filters['worker_id'],
                'status' => $filters['status'],
                'search' => $filters['search'],
                'date_day' => $filters['date_day'],
                'date_month' => $filters['date_month'],
            ],
            'can' => [
                'create' => $user->can('create', [Task::class, $project]),
                'show_my_tasks' => $this->userIsWorkerInProject($user, $project),
                'manage_all_tasks' => $canManageAllTasks,
            ],
        ]);
    }

    public function myTasks(Project $project, Request $request): Response
    {
        $worker = Worker::forProject($project)->where('user_id', $request->user()->id)->firstOrFail();

        $tasks = $this->taskService->listForWorker($worker, [
            'status' => $request->get('status'),
            'date_day' => $request->get('date_day'),
            'date_month' => $request->get('date_month'),
            'per_page' => $request->get('per_page', 15),
        ]);

        $user = $request->user();

        return Inertia::render('Tasks/MyTasks', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'worker' => [
                'id' => $worker->id,
                'full_name' => $worker->full_name,
            ],
            'tasks' => [
                'data' => $tasks->map(fn ($t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                    'description' => $t->description,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'created_at' => $t->created_at->format('Y-m-d H:i'),
                    'completed_at' => $t->completed_at?->format('Y-m-d H:i'),
                    'can_complete' => $user->can('complete', $t),
                ]),
                'links' => $tasks->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $tasks->currentPage(),
                    'last_page' => $tasks->lastPage(),
                    'per_page' => $tasks->perPage(),
                    'total' => $tasks->total(),
                ],
            ],
            'filters' => [
                'status' => $request->get('status'),
                'date_day' => $request->get('date_day'),
                'date_month' => $request->get('date_month'),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Task::class, $project]);
        $this->authorize('assign', [Task::class, $project]);

        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_date' => 'nullable|date',
        ]);

        $worker = Worker::forProject($project)->findOrFail($validated['worker_id']);
        $validated['worker_id'] = $worker->id;

        $this->taskService->create($project, $validated);

        return back()->with('success', 'Task created.');
    }

    public function complete(Request $request, Project $project, Task $task)
    {
        $task = Task::forProject($project)->findOrFail($task->id);
        $this->authorize('complete', $task);

        $this->taskService->complete($task);

        return back()->with('success', 'Task marked as done.');
    }

    public function destroy(Project $project, Task $task)
    {
        $task = Task::forProject($project)->findOrFail($task->id);
        $this->authorize('delete', $task);

        $this->taskService->delete($task);

        return back()->with('success', 'Task deleted.');
    }

    protected function userIsWorkerInProject($user, Project $project): bool
    {
        return Worker::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->exists();
    }
}
