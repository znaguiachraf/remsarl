<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\Worker;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TaskService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function list(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Task::forProject($project)
            ->with(['worker', 'creator']);

        if (!empty($filters['worker_id']) && $filters['worker_id'] !== 'none') {
            $query->where('worker_id', $filters['worker_id']);
        } elseif (isset($filters['worker_id']) && $filters['worker_id'] === 'none') {
            $query->whereRaw('1 = 0');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_day'])) {
            $query->whereDate('created_at', $filters['date_day']);
        }

        if (!empty($filters['date_month'])) {
            $query->whereYear('created_at', substr($filters['date_month'], 0, 4))
                ->whereMonth('created_at', substr($filters['date_month'], 5, 2));
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function listForWorker(Worker $worker, array $filters = []): LengthAwarePaginator
    {
        $query = Task::forProject($worker->project)
            ->where('worker_id', $worker->id)
            ->with(['creator']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_day'])) {
            $query->whereDate('created_at', $filters['date_day']);
        }

        if (!empty($filters['date_month'])) {
            $query->whereYear('created_at', substr($filters['date_month'], 0, 4))
                ->whereMonth('created_at', substr($filters['date_month'], 5, 2));
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function create(Project $project, array $data): Task
    {
        return DB::transaction(function () use ($project, $data) {
            $task = Task::create([
                'project_id' => $project->id,
                'worker_id' => $data['worker_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => TaskStatus::Pending,
                'created_by' => auth()->id(),
                'due_date' => $data['due_date'] ?? null,
            ]);

            $this->activityLogService->log(
                $project,
                'created',
                $task,
                null,
                $task->toArray(),
                'tasks',
                "Task \"{$task->title}\" assigned to {$task->worker->full_name}"
            );

            return $task;
        });
    }

    public function complete(Task $task): Task
    {
        return DB::transaction(function () use ($task) {
            $oldValues = $task->toArray();
            $task->update([
                'status' => TaskStatus::Done,
                'completed_at' => now(),
            ]);

            $this->activityLogService->log(
                $task->project,
                'completed',
                $task->fresh(),
                $oldValues,
                $task->fresh()->toArray(),
                'tasks',
                "Task \"{$task->title}\" marked as done by {$task->worker->full_name}"
            );

            return $task->fresh();
        });
    }

    public function delete(Task $task): void
    {
        $project = $task->project;
        $title = $task->title;
        $snapshot = $task->toArray();

        DB::transaction(function () use ($task, $project, $title, $snapshot) {
            $this->activityLogService->log(
                $project,
                'deleted',
                $task,
                $snapshot,
                null,
                'tasks',
                "Task \"{$title}\" deleted"
            );

            $task->delete();
        });
    }
}
