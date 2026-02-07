<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('supplier.view') ?? false);
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->isOwnerOf($supplier->project)
            || ($user->roleOnProject($supplier->project)?->hasPermission('supplier.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('supplier.create') ?? false);
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->isOwnerOf($supplier->project)
            || ($user->roleOnProject($supplier->project)?->hasPermission('supplier.update') ?? false);
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->isOwnerOf($supplier->project)
            || ($user->roleOnProject($supplier->project)?->hasPermission('supplier.delete') ?? false);
    }
}
