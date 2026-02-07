<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use App\Services\ExpenseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Expense::class, $project]);

        $expenses = $this->expenseService->list($project, [
            'status' => $request->get('status'),
            'category_id' => $request->get('category_id'),
            'from_date' => $request->get('from_date'),
            'to_date' => $request->get('to_date'),
            'month' => $request->get('month'),
            'per_page' => $request->get('per_page', 15),
        ]);

        $categories = ExpenseCategory::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'color']);
        $suppliers = \App\Models\Supplier::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        $user = $request->user();

        return Inertia::render('Expenses/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'expenses' => [
                'data' => $expenses->map(fn ($e) => [
                    'id' => $e->id,
                    'reference' => $e->reference,
                    'description' => $e->description,
                    'amount' => (float) $e->amount,
                    'status' => $e->status->value,
                    'status_label' => $e->status->label(),
                    'expense_date' => $e->expense_date->format('Y-m-d'),
                    'expense_category' => $e->expenseCategory ? [
                        'id' => $e->expenseCategory->id,
                        'name' => $e->expenseCategory->name,
                        'color' => $e->expenseCategory->color,
                    ] : null,
                    'supplier' => $e->supplier ? [
                        'id' => $e->supplier->id,
                        'name' => $e->supplier->name,
                    ] : null,
                    'user' => $e->user ? ['name' => $e->user->name] : null,
                    'can_update' => $user->can('update', $e),
                    'can_pay' => $user->can('pay', $e),
                ]),
                'links' => $expenses->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $expenses->currentPage(),
                    'last_page' => $expenses->lastPage(),
                    'per_page' => $expenses->perPage(),
                    'total' => $expenses->total(),
                ],
            ],
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'color' => $c->color,
            ])->values()->toArray(),
            'suppliers' => $suppliers->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
            ])->values()->toArray(),
            'filters' => [
                'status' => $request->get('status'),
                'category_id' => $request->get('category_id'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
                'month' => $request->get('month'),
            ],
            'can' => [
                'create' => $user->can('create', [Expense::class, $project]),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Expense::class, $project]);

        $request->merge([
            'expense_category_id' => $request->input('expense_category_id') ?: null,
            'supplier_id' => $request->input('supplier_id') ?: null,
        ]);

        $validated = $request->validate([
            'expense_category_id' => 'nullable|exists:expense_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'reference' => 'nullable|string|max:100',
            'description' => 'required|string|max:500',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
        ]);

        $this->ensureResourceBelongsToProject($project, $validated['expense_category_id'] ?? null, 'expense_categories');
        $this->ensureResourceBelongsToProject($project, $validated['supplier_id'] ?? null, 'suppliers');

        $this->expenseService->create($project, $validated);

        return back()->with('success', 'Expense created.');
    }

    public function update(Request $request, Project $project, Expense $expense)
    {
        $this->authorize('update', $expense);
        $this->ensureExpenseBelongsToProject($project, $expense);

        $request->merge([
            'expense_category_id' => $request->input('expense_category_id') ?: null,
            'supplier_id' => $request->input('supplier_id') ?: null,
        ]);

        $validated = $request->validate([
            'expense_category_id' => 'nullable|exists:expense_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'reference' => 'nullable|string|max:100',
            'description' => 'required|string|max:500',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'status' => 'required|in:pending,paid',
        ]);

        $this->ensureResourceBelongsToProject($project, $validated['expense_category_id'] ?? null, 'expense_categories');
        $this->ensureResourceBelongsToProject($project, $validated['supplier_id'] ?? null, 'suppliers');

        $this->expenseService->update($expense, $validated);

        return back()->with('success', 'Expense updated.');
    }

    public function pay(Request $request, Project $project, Expense $expense)
    {
        $this->authorize('pay', $expense);
        $this->ensureExpenseBelongsToProject($project, $expense);

        if ($expense->isPaid()) {
            return back()->with('error', 'Expense is already paid.');
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,card,transfer,check,other',
            'amount' => 'required|numeric|min:0',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $this->expenseService->pay($expense, $validated);

        return back()->with('success', 'Expense marked as paid.');
    }

    protected function ensureExpenseBelongsToProject(Project $project, Expense $expense): void
    {
        if ($expense->project_id !== $project->id) {
            abort(403, 'Expense does not belong to this project.');
        }
    }

    protected function ensureResourceBelongsToProject(Project $project, ?int $resourceId, string $table): void
    {
        if (!$resourceId) {
            return;
        }
        $exists = DB::table($table)->where('id', $resourceId)->where('project_id', $project->id)->exists();
        if (!$exists) {
            abort(403, 'Resource does not belong to this project.');
        }
    }
}
