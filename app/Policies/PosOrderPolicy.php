<?php

namespace App\Policies;

use App\Models\PosOrder;
use App\Models\Project;
use App\Models\User;

class PosOrderPolicy
{
    public function createOrder(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('pos.create_order') ?? false)
            || ($user->roleOnProject($project)?->hasPermission('pos.access') ?? false);
    }

    public function payOrder(User $user, PosOrder $order): bool
    {
        if ($order->status === 'cancelled') {
            return false;
        }

        return $user->isOwnerOf($order->project)
            || ($user->roleOnProject($order->project)?->hasPermission('pos.pay_order') ?? false)
            || ($user->roleOnProject($order->project)?->hasPermission('pos.access') ?? false);
    }
}
