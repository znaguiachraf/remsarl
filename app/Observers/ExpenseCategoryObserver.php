<?php

namespace App\Observers;

use App\Models\ExpenseCategory;
use App\Services\ActivityLogService;

class ExpenseCategoryObserver
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function created(ExpenseCategory $category): void
    {
        $this->activityLogService->log(
            $category->project,
            'created',
            $category,
            null,
            $category->toArray(),
            'expenses',
            "Expense category \"{$category->name}\" created"
        );
    }

    public function updated(ExpenseCategory $category): void
    {
        $this->activityLogService->log(
            $category->project,
            'updated',
            $category,
            $category->getOriginal(),
            $category->getChanges(),
            'expenses',
            "Expense category \"{$category->name}\" updated"
        );
    }

    public function deleted(ExpenseCategory $category): void
    {
        $this->activityLogService->log(
            $category->project,
            'deleted',
            $category,
            $category->toArray(),
            null,
            'expenses',
            "Expense category \"{$category->name}\" deleted"
        );
    }
}
