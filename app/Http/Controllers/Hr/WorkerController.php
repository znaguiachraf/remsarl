<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Worker;
use App\Services\WorkerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkerController extends Controller
{
    public function __construct(
        protected WorkerService $workerService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Worker::class, $project]);

        $workers = $this->workerService->list($project, [
            'search' => $request->get('search'),
            'per_page' => $request->get('per_page', 15),
        ]);

        $user = $request->user();

        return Inertia::render('Hr/Workers/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'workers' => [
                'data' => $workers->map(fn ($w) => [
                    'id' => $w->id,
                    'full_name' => $w->full_name,
                    'first_name' => $w->first_name,
                    'last_name' => $w->last_name,
                    'email' => $w->email,
                    'phone' => $w->phone,
                    'employee_number' => $w->employee_number,
                    'cnss_number' => $w->cnss_number,
                    'hire_date' => $w->hire_date?->format('Y-m-d'),
                    'active_contract' => $w->activeContract ? [
                        'id' => $w->activeContract->id,
                        'type' => $w->activeContract->type->value,
                        'type_label' => $w->activeContract->type->label(),
                        'salary_amount' => (float) $w->activeContract->salary_amount,
                    ] : null,
                    'can_update' => $user->can('update', $w),
                    'can_delete' => $user->can('delete', $w),
                ]),
                'links' => $workers->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $workers->currentPage(),
                    'last_page' => $workers->lastPage(),
                    'per_page' => $workers->perPage(),
                    'total' => $workers->total(),
                ],
            ],
            'filters' => [
                'search' => $request->get('search'),
            ],
            'can' => [
                'create' => $user->can('create', [Worker::class, $project]),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Worker::class, $project]);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date',
            'hire_date' => 'nullable|date',
            'employee_number' => 'nullable|string|max:50',
            'cnss_number' => 'nullable|string|max:100',
        ]);

        $this->workerService->create($project, $validated);

        return back()->with('success', 'Worker created.');
    }

    public function show(Project $project, Worker $worker, Request $request): Response
    {
        $this->authorize('view', $worker);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $worker->load([
            'user',
            'contracts' => fn ($q) => $q->orderByDesc('start_date'),
            'cnssRecords',
            'salaries' => fn ($q) => $q->orderByDesc('year')->orderByDesc('month')->limit(12),
            'vacations' => fn ($q) => $q->orderByDesc('start_date')->limit(10),
        ]);

        $user = $request->user();

        return Inertia::render('Hr/Workers/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'worker' => [
                'id' => $worker->id,
                'full_name' => $worker->full_name,
                'first_name' => $worker->first_name,
                'last_name' => $worker->last_name,
                'email' => $worker->email,
                'phone' => $worker->phone,
                'address' => $worker->address,
                'birth_date' => $worker->birth_date?->format('Y-m-d'),
                'hire_date' => $worker->hire_date?->format('Y-m-d'),
                'employee_number' => $worker->employee_number,
                'cnss_number' => $worker->cnss_number,
                'user' => $worker->user ? ['id' => $worker->user->id, 'name' => $worker->user->name] : null,
                'contracts' => $worker->contracts->map(fn ($c) => [
                    'id' => $c->id,
                    'type' => $c->type->value,
                    'type_label' => $c->type->label(),
                    'status' => $c->status->value,
                    'status_label' => $c->status->label(),
                    'start_date' => $c->start_date->format('Y-m-d'),
                    'end_date' => $c->end_date?->format('Y-m-d'),
                    'salary_amount' => (float) $c->salary_amount,
                    'salary_currency' => $c->salary_currency,
                ]),
                'cnss_records' => $worker->cnssRecords->map(fn ($r) => [
                    'id' => $r->id,
                    'registration_number' => $r->registration_number,
                    'registration_date' => $r->registration_date?->format('Y-m-d'),
                    'status' => $r->status->value,
                ]),
                'salaries' => $worker->salaries->map(fn ($s) => [
                    'id' => $s->id,
                    'month' => $s->month,
                    'year' => $s->year,
                    'gross_amount' => (float) $s->gross_amount,
                    'net_amount' => (float) $s->net_amount,
                    'status' => $s->status->value,
                    'status_label' => $s->status->label(),
                ]),
                'vacations' => $worker->vacations->map(fn ($v) => [
                    'id' => $v->id,
                    'start_date' => $v->start_date->format('Y-m-d'),
                    'end_date' => $v->end_date->format('Y-m-d'),
                    'days_count' => $v->days_count,
                    'status' => $v->status->value,
                    'status_label' => $v->status->label(),
                    'can_approve' => $user->can('approve', $v),
                    'can_reject' => $user->can('reject', $v),
                ]),
            ],
            'can' => [
                'update' => $user->can('update', $worker),
                'delete' => $user->can('delete', $worker),
                'create_contract' => $user->can('create', [\App\Models\Contract::class, $project]),
                'create_salary' => $user->can('create', [\App\Models\Salary::class, $project]),
                'create_attendance' => $user->can('create', [\App\Models\Attendance::class, $project]),
                'create_vacation' => $user->can('create', [\App\Models\Vacation::class, $project]),
                'create_cnss' => $user->can('create', [\App\Models\CnssRecord::class, $project]),
            ],
        ]);
    }

    public function update(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('update', $worker);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date',
            'hire_date' => 'nullable|date',
            'employee_number' => 'nullable|string|max:50',
            'cnss_number' => 'nullable|string|max:100',
        ]);

        $this->workerService->update($worker, $validated);

        return back()->with('success', 'Worker updated.');
    }

    public function destroy(Project $project, Worker $worker)
    {
        $this->authorize('delete', $worker);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $this->workerService->delete($worker);

        return back()->with('success', 'Worker deleted.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, Worker $worker): void
    {
        if ($worker->project_id !== $project->id) {
            abort(403, 'Worker does not belong to this project.');
        }
    }
}
