<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Project;
use App\Models\Worker;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        return response()->json([
            'attendances' => $attendances->map(fn ($a) => [
                'id' => $a->id,
                'date' => $a->date->format('Y-m-d'),
                'status' => $a->status->value,
                'status_label' => $a->status->label(),
            ]),
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
