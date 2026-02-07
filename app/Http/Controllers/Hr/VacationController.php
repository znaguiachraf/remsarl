<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Enums\VacationStatus;
use App\Models\Project;
use App\Models\Vacation;
use App\Models\Worker;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VacationController extends Controller
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

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
