<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class WorkerService
{
    public const DEFAULT_WORKER_PASSWORD = 'password';

    public function __construct(
        protected ActivityLogService $activityLogService,
        protected ProjectService $projectService
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
            $userId = $data['user_id'] ?? $this->resolveOrCreateUserForWorker($project, $data);

            $worker = Worker::create([
                'project_id' => $project->id,
                'user_id' => $userId,
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

            $user = User::find($userId);
            if ($user) {
                $this->assignWorkerToProject($project, $user);
            }

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

    /**
     * Assign the worker's user to the project with the default member role (if not already assigned).
     */
    protected function assignWorkerToProject(Project $project, User $user): void
    {
        if ($project->users()->where('user_id', $user->id)->exists()) {
            return;
        }
        $memberRole = Role::where('slug', 'member')->first();
        if ($memberRole) {
            $this->projectService->assignUser($project, $user, $memberRole);
        }
    }

    /**
     * Resolve existing user by email or create a new user for the worker (with default password).
     */
    protected function resolveOrCreateUserForWorker(Project $project, array $data): ?int
    {
        $name = trim("{$data['first_name']} {$data['last_name']}");
        $email = $data['email'] ?? null;

        if ($email) {
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                return $existingUser->id;
            }
        }

        $email = $email ?: 'worker_' . $project->id . '_' . uniqid() . '@internal.local';

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make(self::DEFAULT_WORKER_PASSWORD),
        ]);

        return $user->id;
    }

    /**
     * Sync the linked User's name and email with the worker (for auto-created users).
     */
    protected function syncUserWithWorker(Worker $worker): void
    {
        if (!$worker->user_id || !$worker->user) {
            return;
        }

        $user = $worker->user;
        $updates = [];

        if ($user->name !== $worker->full_name) {
            $updates['name'] = $worker->full_name;
        }
        if ($worker->email && $user->email !== $worker->email && str_contains($user->email, '@internal.local')) {
            if (!User::where('email', $worker->email)->where('id', '!=', $user->id)->exists()) {
                $updates['email'] = $worker->email;
            }
        }

        if (!empty($updates)) {
            $user->update($updates);
        }
    }

    public function update(Worker $worker, array $data): Worker
    {
        $oldValues = $worker->toArray();

        return DB::transaction(function () use ($worker, $data, $oldValues) {
            $userId = $data['user_id'] ?? $worker->user_id;
            if ($userId === null) {
                $userId = $this->resolveOrCreateUserForWorker($worker->project, array_merge($worker->toArray(), $data));
            }

            $worker->update([
                'user_id' => $userId,
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

            $user = User::find($userId);
            if ($user) {
                $this->assignWorkerToProject($worker->project, $user);
            }
            $this->syncUserWithWorker($worker->fresh());

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
