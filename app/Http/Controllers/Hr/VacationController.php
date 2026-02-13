<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Enums\VacationStatus;
use App\Models\Project;
use App\Models\Vacation;
use App\Models\Worker;
use App\Services\ActivityLogService;
use App\Services\VacationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VacationController extends Controller
{
    public function __construct(
        protected ActivityLogService $activityLogService,
        protected VacationService $vacationService
    ) {}

    /**
     * List all vacations for the project: workers summary, calendar events, history.
     */
    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Vacation::class, $project]);

        $year = (int) ($request->get('year') ?? date('Y'));
        $workerId = $request->get('worker_id');
        $status = $request->get('status');

        $workersSummary = $this->vacationService->getWorkersVacationSummary($project, $year);

        $from = "{$year}-01-01";
        $to = "{$year}-12-31";
        $calendarEvents = $this->vacationService->getCalendarEvents($project, $from, $to);

        $vacations = $this->vacationService->listForProject($project, [
            'worker_id' => $workerId,
            'status' => $status,
            'year' => $year,
            'per_page' => $request->get('per_page', 15),
        ]);

        $workers = Worker::forProject($project)->orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('Hr/Vacations/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'workersSummary' => $workersSummary,
            'calendarEvents' => $calendarEvents,
            'vacations' => [
                'data' => $vacations->map(fn ($v) => [
                    'id' => $v->id,
                    'worker_id' => $v->worker_id,
                    'worker_name' => $v->worker->full_name ?? '—',
                    'start_date' => $v->start_date->format('Y-m-d'),
                    'end_date' => $v->end_date->format('Y-m-d'),
                    'days_count' => $v->days_count,
                    'status' => $v->status->value,
                    'status_label' => $v->status->label(),
                ]),
                'links' => $vacations->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $vacations->currentPage(),
                    'last_page' => $vacations->lastPage(),
                    'per_page' => $vacations->perPage(),
                    'total' => $vacations->total(),
                ],
            ],
            'workers' => $workers->map(fn ($w) => ['id' => $w->id, 'name' => $w->full_name])->values()->toArray(),
            'filters' => [
                'year' => $year,
                'worker_id' => $workerId,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('create', [Vacation::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string|max:500',
        ]);

        $vacation = DB::transaction(function () use ($project, $worker, $validated) {
            $vacation = Vacation::create([
                'project_id' => $project->id,
                'worker_id' => $worker->id,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status' => VacationStatus::Pending,
                'notes' => $validated['notes'] ?? null,
            ]);

            $this->activityLogService->log(
                $project,
                'created',
                $vacation,
                null,
                $vacation->toArray(),
                'hr',
                "Vacation request for {$worker->full_name}"
            );

            return $vacation;
        });

        return back()->with('success', 'Vacation request submitted.');
    }

    public function approve(Request $request, Project $project, Vacation $vacation)
    {
        $this->authorize('approve', $vacation);
        if ($vacation->project_id !== $project->id) {
            abort(403);
        }

        if ($vacation->status !== VacationStatus::Pending) {
            return back()->with('error', 'Vacation is not pending.');
        }

        DB::transaction(function () use ($vacation) {
            $vacation->update([
                'status' => VacationStatus::Approved,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            $this->activityLogService->log(
                $vacation->project,
                'approved',
                $vacation,
                ['status' => 'pending'],
                ['status' => 'approved'],
                'hr',
                "Vacation #{$vacation->id} approved"
            );
        });

        return back()->with('success', 'Vacation approved.');
    }

    public function reject(Request $request, Project $project, Vacation $vacation)
    {
        $this->authorize('reject', $vacation);
        if ($vacation->project_id !== $project->id) {
            abort(403);
        }

        if ($vacation->status !== VacationStatus::Pending) {
            return back()->with('error', 'Vacation is not pending.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($vacation, $validated) {
            $vacation->update([
                'status' => VacationStatus::Rejected,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $validated['rejection_reason'] ?? null,
            ]);

            $this->activityLogService->log(
                $vacation->project,
                'rejected',
                $vacation,
                ['status' => 'pending'],
                ['status' => 'rejected'],
                'hr',
                "Vacation #{$vacation->id} rejected"
            );
        });

        return back()->with('success', 'Vacation rejected.');
    }

    public function destroy(Project $project, Vacation $vacation)
    {
        $this->authorize('delete', $vacation);
        if ($vacation->project_id !== $project->id) {
            abort(403);
        }

        if ($vacation->status !== VacationStatus::Pending) {
            return back()->with('error', 'Only pending vacations can be deleted.');
        }

        $vacation->delete();

        return back()->with('success', 'Vacation request cancelled.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, Worker $worker): void
    {
        if ($worker->project_id !== $project->id) {
            abort(403);
        }
    }
}
