<?php

namespace App\Services;

use App\Enums\ExpenseStatus;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Project;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function list(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Expense::forProject($project)
            ->with(['expenseCategory', 'user'])
            ->orderByDesc('expense_date');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['category_id'])) {
            $query->where('expense_category_id', $filters['category_id']);
        }
        if (!empty($filters['month'])) {
            $query->whereYear('expense_date', substr($filters['month'], 0, 4))
                ->whereMonth('expense_date', substr($filters['month'], 5, 2));
        } elseif (!empty($filters['from_date']) || !empty($filters['to_date'])) {
            if (!empty($filters['from_date'])) {
                $query->whereDate('expense_date', '>=', $filters['from_date']);
            }
            if (!empty($filters['to_date'])) {
                $query->whereDate('expense_date', '<=', $filters['to_date']);
            }
        }

        return $query->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function create(Project $project, array $data): Expense
    {
        $expense = DB::transaction(function () use ($project, $data) {
            $expense = Expense::create([
                'project_id' => $project->id,
                'expense_category_id' => $data['expense_category_id'] ?? null,
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'],
                'amount' => $data['amount'],
                'status' => ExpenseStatus::Pending,
                'expense_date' => $data['expense_date'],
                'user_id' => auth()->id(),
            ]);

            $this->activityLogService->log(
                $project,
                'created',
                $expense,
                null,
                $expense->toArray(),
                'expenses',
                "Expense #{$expense->id} created"
            );

            return $expense;
        });

        return $expense->load(['expenseCategory']);
    }

    public function update(Expense $expense, array $data): Expense
    {
        $oldValues = $expense->toArray();

        $expense = DB::transaction(function () use ($expense, $data, $oldValues) {
            $expense->update([
                'expense_category_id' => $data['expense_category_id'] ?? $expense->expense_category_id,
                'reference' => $data['reference'] ?? $expense->reference,
                'description' => $data['description'] ?? $expense->description,
                'amount' => $data['amount'] ?? $expense->amount,
                'expense_date' => $data['expense_date'] ?? $expense->expense_date,
                'status' => $data['status'] ?? $expense->status->value,
            ]);

            $this->activityLogService->log(
                $expense->project,
                'updated',
                $expense,
                $oldValues,
                $expense->fresh()->toArray(),
                'expenses',
                "Expense #{$expense->id} updated"
            );

            return $expense->fresh(['expenseCategory']);
        });

        return $expense;
    }

    public function pay(Expense $expense, array $paymentData): Expense
    {
        $expense = DB::transaction(function () use ($expense) {
            $expense->update(['status' => ExpenseStatus::Paid]);

            $this->activityLogService->log(
                $expense->project,
                'paid',
                $expense,
                ['status' => 'pending'],
                ['status' => 'paid'],
                'expenses',
                "Expense #{$expense->id} marked as paid"
            );

            return $expense->fresh(['expenseCategory']);
        });

        return $expense;
    }
}
