<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\CnssRecord;
use App\Models\Project;
use App\Models\Worker;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CnssRecordController extends Controller
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function store(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('create', [CnssRecord::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'registration_number' => 'required|string|max:100',
            'registration_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,suspended',
            'notes' => 'nullable|string|max:500',
        ]);

        $record = DB::transaction(function () use ($project, $worker, $validated) {
            $record = CnssRecord::create([
                'project_id' => $project->id,
                'worker_id' => $worker->id,
                'registration_number' => $validated['registration_number'],
                'registration_date' => $validated['registration_date'] ?? null,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $this->activityLogService->log(
                $project,
                'created',
                $record,
                null,
                $record->toArray(),
                'hr',
                "CNSS record for {$worker->full_name}"
            );

            return $record;
        });

        return back()->with('success', 'CNSS record added.');
    }

    public function update(Request $request, Project $project, CnssRecord $cnssRecord)
    {
        $this->authorize('update', $cnssRecord);
        if ($cnssRecord->project_id !== $project->id) {
            abort(403);
        }

        $validated = $request->validate([
            'registration_number' => 'required|string|max:100',
            'registration_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,suspended',
            'notes' => 'nullable|string|max:500',
        ]);

        $oldValues = $cnssRecord->toArray();
        $cnssRecord->update($validated);

        $this->activityLogService->log(
            $project,
            'updated',
            $cnssRecord,
            $oldValues,
            $cnssRecord->fresh()->toArray(),
            'hr',
            "CNSS record #{$cnssRecord->id} updated"
        );

        return back()->with('success', 'CNSS record updated.');
    }

    public function destroy(Project $project, CnssRecord $cnssRecord)
    {
        $this->authorize('delete', $cnssRecord);
        if ($cnssRecord->project_id !== $project->id) {
            abort(403);
        }

        $cnssRecord->delete();

        return back()->with('success', 'CNSS record removed.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, Worker $worker): void
    {
        if ($worker->project_id !== $project->id) {
            abort(403);
        }
    }
}
