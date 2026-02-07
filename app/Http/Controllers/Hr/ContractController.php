<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Project;
use App\Models\Worker;
use App\Services\ContractService;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function __construct(
        protected ContractService $contractService
    ) {}

    public function store(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('create', [Contract::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'type' => 'required|in:cdi,cdd,freelance',
            'status' => 'required|in:draft,active,terminated,expired',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'salary_amount' => 'required|numeric|min:0',
            'salary_currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->contractService->create($worker, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Contract created.');
    }

    public function update(Request $request, Project $project, Contract $contract)
    {
        $this->authorize('update', $contract);
        $this->ensureContractBelongsToProject($project, $contract);

        $validated = $request->validate([
            'type' => 'required|in:cdi,cdd,freelance',
            'status' => 'required|in:draft,active,terminated,expired',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'salary_amount' => 'required|numeric|min:0',
            'salary_currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->contractService->update($contract, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Contract updated.');
    }

    public function destroy(Project $project, Contract $contract)
    {
        $this->authorize('delete', $contract);
        $this->ensureContractBelongsToProject($project, $contract);

        $contract->delete();

        return back()->with('success', 'Contract deleted.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, Worker $worker): void
    {
        if ($worker->project_id !== $project->id) {
            abort(403);
        }
    }

    protected function ensureContractBelongsToProject(Project $project, Contract $contract): void
    {
        if ($contract->project_id !== $project->id) {
            abort(403);
        }
    }
}
