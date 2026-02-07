<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Project;
use App\Models\Worker;
use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Project $project, Worker $worker, Request $request)
    {
        $this->authorize('viewAny', [Attendance::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $attendances = Attendance::forProject($project)
            ->where('worker_id', $worker->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date')
            ->get();

        $user = $request->user();

        return response()->json([
            'attendances' => $attendances->map(fn ($a) => [
                'id' => $a->id,
                'date' => $a->date->format('Y-m-d'),
                'status' => $a->status->value,
                'status_label' => $a->status->label(),
                'notes' => $a->notes,
                'can_delete' => $user->can('delete', $a),
            ]),
        ]);
    }

    public function projectIndex(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Attendance::class, $project]);

        $month = (int) $request->get('month', now()->month);
        $year = (int) $request->get('year', now()->year);

        $workers = Worker::forProject($project)
            ->with([
                'attendances' => fn ($q) => $q
                    ->whereYear('date', $year)
                    ->whereMonth('date', $month),
                'vacations' => fn ($q) => $q->where('status', \App\Enums\VacationStatus::Approved),
            ])
            ->orderBy('last_name')
            ->get();

        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $attendancesByWorker = [];
        $vacationsByWorker = [];
        foreach ($workers as $worker) {
            $byDate = [];
            foreach ($worker->attendances as $a) {
                $byDate[$a->date->format('Y-m-d')] = [
                    'id' => $a->id,
                    'status' => $a->status->value,
                    'status_label' => $a->status->label(),
                ];
            }
            $attendancesByWorker[$worker->id] = $byDate;
            $vacationsByWorker[$worker->id] = $worker->vacations->map(fn ($v) => [
                'start_date' => $v->start_date->format('Y-m-d'),
                'end_date' => $v->end_date->format('Y-m-d'),
            ])->toArray();
        }

        return Inertia::render('Hr/Attendance/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'workers' => $workers->map(fn ($w) => [
                'id' => $w->id,
                'full_name' => $w->full_name,
            ]),
            'attendances_by_worker' => $attendancesByWorker,
            'vacations_by_worker' => $vacationsByWorker,
            'month' => $month,
            'year' => $year,
            'days_in_month' => $daysInMonth,
            'can' => [
                'create' => $request->user()->can('create', [Attendance::class, $project]),
            ],
        ]);
    }

    public function store(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('create', [Attendance::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'date' => 'required|date',
            'status' => 'required|in:present,absent,half_day,leave,late,excused',
            'notes' => 'nullable|string|max:500',
        ]);

        $attendance = DB::transaction(function () use ($project, $worker, $validated) {
            $attendance = Attendance::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'worker_id' => $worker->id,
                    'date' => $validated['date'],
                ],
                [
                    'status' => $validated['status'],
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            $this->activityLogService->log(
                $project,
                $attendance->wasRecentlyCreated ? 'created' : 'updated',
                $attendance,
                $attendance->wasRecentlyCreated ? null : $attendance->getOriginal(),
                $attendance->toArray(),
                'hr',
                "Attendance for {$worker->full_name} on {$validated['date']}"
            );

            return $attendance;
        });

        return back()->with('success', 'Attendance recorded.');
    }

    public function storeBulk(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('create', [Attendance::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'dates' => 'required|array',
            'dates.*' => 'required|date',
            'status' => 'required|in:present,absent,half_day,leave,late,excused',
            'notes' => 'nullable|string|max:500',
        ]);

        $dates = array_unique($validated['dates']);
        $count = 0;

        DB::transaction(function () use ($project, $worker, $dates, $validated, &$count) {
            foreach ($dates as $date) {
                Attendance::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'worker_id' => $worker->id,
                        'date' => $date,
                    ],
                    [
                        'status' => $validated['status'],
                        'notes' => $validated['notes'] ?? null,
                    ]
                );
                $count++;
            }
            $this->activityLogService->log(
                $project,
                'created',
                $worker,
                null,
                ['dates' => $dates, 'status' => $validated['status'], 'count' => $count],
                'hr',
                "Bulk attendance ({$count} days) for {$worker->full_name}: {$validated['status']}"
            );
        });

        return back()->with('success', "Attendance recorded for {$count} day(s).");
    }

    public function destroy(Project $project, Attendance $attendance)
    {
        $this->authorize('delete', $attendance);
        if ($attendance->project_id !== $project->id) {
            abort(403);
        }

        $attendance->delete();

        return back()->with('success', 'Attendance removed.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, Worker $worker): void
    {
        if ($worker->project_id !== $project->id) {
            abort(403);
        }
    }
}
