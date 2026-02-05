<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\Project;
use App\Models\User;

class SalePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('sale.view') ?? false);
    }

    public function view(User $user, Sale $sale): bool
    {
        return $user->isOwnerOf($sale->project)
            || ($user->roleOnProject($sale->project)?->hasPermission('sale.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('sale.create') ?? false);
    }

    public function update(User $user, Sale $sale): bool
    {
        if (in_array($sale->status, ['cancelled', 'refunded'])) {
            return false;
        }

        return $user->isOwnerOf($sale->project)
            || ($user->roleOnProject($sale->project)?->hasPermission('sale.update') ?? false);
    }

    public function pay(User $user, Sale $sale): bool
    {
        if (in_array($sale->status, ['cancelled', 'refunded'])) {
            return false;
        }

        return $user->isOwnerOf($sale->project)
            || ($user->roleOnProject($sale->project)?->hasPermission('sale.pay') ?? false);
    }
}
