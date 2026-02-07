<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Worker;
use Illuminate\Support\Facades\DB;

class WorkerService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function list(Project $project, array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Worker::forProject($project)
            ->with(['user', 'activeContract'])
            ->orderBy('last_name');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_number', 'like', "%{$search}%")
                    ->orWhere('cnss_number', 'like', "%{$search}%");
            });
        }

        return $query->paginate($filters['per_page'] ?? 15)->withQueryString();
    }

    public function create(Project $project, array $data): Worker
    {
        return DB::transaction(function () use ($project, $data) {
            $worker = Worker::create([
                'project_id' => $project->id,
                'user_id' => $data['user_id'] ?? null,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
                'employee_number' => $data['employee_number'] ?? null,
                'cnss_number' => $data['cnss_number'] ?? null,
            ]);

            $this->activityLogService->log(
                $project,
                'created',
                $worker,
                null,
                $worker->toArray(),
                'hr',
                "Worker {$worker->full_name} created"
            );

            return $worker;
        });
    }

    public function update(Worker $worker, array $data): Worker
    {
        $oldValues = $worker->toArray();

        return DB::transaction(function () use ($worker, $data, $oldValues) {
            $worker->update([
                'user_id' => $data['user_id'] ?? $worker->user_id,
                'first_name' => $data['first_name'] ?? $worker->first_name,
                'last_name' => $data['last_name'] ?? $worker->last_name,
                'email' => $data['email'] ?? $worker->email,
                'phone' => $data['phone'] ?? $worker->phone,
                'address' => $data['address'] ?? $worker->address,
                'birth_date' => $data['birth_date'] ?? $worker->birth_date,
                'hire_date' => $data['hire_date'] ?? $worker->hire_date,
                'employee_number' => $data['employee_number'] ?? $worker->employee_number,
                'cnss_number' => $data['cnss_number'] ?? $worker->cnss_number,
            ]);

            $this->activityLogService->log(
                $worker->project,
                'updated',
                $worker,
                $oldValues,
                $worker->fresh()->toArray(),
                'hr',
                "Worker {$worker->full_name} updated"
            );

            return $worker->fresh();
        });
    }

    public function delete(Worker $worker): void
    {
        $project = $worker->project;
        $name = $worker->full_name;
        $snapshot = $worker->toArray();

        DB::transaction(function () use ($worker, $project, $name, $snapshot) {
            $this->activityLogService->log(
                $project,
                'deleted',
                $worker,
                $snapshot,
                null,
                'hr',
                "Worker {$name} deleted"
            );

            $worker->delete();
        });
    }
}
