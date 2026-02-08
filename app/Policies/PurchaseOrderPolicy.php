<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('purchase.view') ?? false);
    }

    public function view(User $user, PurchaseOrder $order): bool
    {
        return $user->isOwnerOf($order->project)
            || ($user->roleOnProject($order->project)?->hasPermission('purchase.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('purchase.create') ?? false);
    }

    public function update(User $user, PurchaseOrder $order): bool
    {
        return $user->isOwnerOf($order->project)
            || ($user->roleOnProject($order->project)?->hasPermission('purchase.update') ?? false);
    }

    public function receive(User $user, PurchaseOrder $order): bool
    {
        return $user->isOwnerOf($order->project)
            || ($user->roleOnProject($order->project)?->hasPermission('purchase.receive') ?? false);
    }
}
