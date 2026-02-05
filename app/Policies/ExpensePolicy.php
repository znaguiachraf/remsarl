<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\Project;
use App\Models\User;

class ExpensePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('expense.view') ?? false);
    }

    public function view(User $user, Expense $expense): bool
    {
        return $this->viewAny($user, $expense->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('expense.create') ?? false);
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->isOwnerOf($expense->project)
            || ($user->roleOnProject($expense->project)?->hasPermission('expense.update') ?? false);
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $this->update($user, $expense);
    }

    public function pay(User $user, Expense $expense): bool
    {
        return $user->isOwnerOf($expense->project)
            || ($user->roleOnProject($expense->project)?->hasPermission('expense.pay') ?? false);
    }

    /**
     * Manage expense categories (create/update/delete). Accepts Project since
     * categories are project-scoped, not tied to a specific expense.
     */
    public function manageCategories(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('expense.update') ?? false);
    }
}
