<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Salary;
use App\Models\Worker;
use App\Services\SalaryService;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    public function __construct(
        protected SalaryService $salaryService
    ) {}

    public function generate(Request $request, Project $project, Worker $worker)
    {
        $this->authorize('create', [Salary::class, $project]);
        $this->ensureWorkerBelongsToProject($project, $worker);

        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        try {
            $this->salaryService->generate($worker, (int) $validated['month'], (int) $validated['year']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Salary generated.');
    }

    public function pay(Request $request, Project $project, Salary $salary)
    {
        $this->authorize('update', $salary);
        $this->ensureSalaryBelongsToProject($project, $salary);

        $validated = $request->validate([
            'payment_method' => 'required|in:cash,card,transfer,check,other',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $this->salaryService->recordPayment($salary, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Payment recorded.');
    }

    public function update(Request $request, Project $project, Salary $salary)
    {
        $this->authorize('update', $salary);
        $this->ensureSalaryBelongsToProject($project, $salary);

        $validated = $request->validate([
            'gross_amount' => 'required|numeric|min:0',
            'net_amount' => 'required|numeric|min:0',
            'absent_days' => 'nullable|numeric|min:0',
            'attendance_deduction' => 'nullable|numeric|min:0',
        ]);

        try {
            $this->salaryService->update($salary, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Salary updated.');
    }

    public function destroy(Project $project, Salary $salary)
    {
        $this->authorize('delete', $salary);
        $this->ensureSalaryBelongsToProject($project, $salary);

        try {
            $this->salaryService->delete($salary);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Salary deleted.');
    }

    protected function ensureWorkerBelongsToProject(Project $project, Worker $worker): void
    {
        if ($worker->project_id !== $project->id) {
            abort(403);
        }
    }

    protected function ensureSalaryBelongsToProject(Project $project, Salary $salary): void
    {
        if ($salary->project_id !== $project->id) {
            abort(403);
        }
    }
}
