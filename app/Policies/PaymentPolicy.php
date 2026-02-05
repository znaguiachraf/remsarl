<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\Project;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('payment.view') ?? false);
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->isOwnerOf($payment->project)
            || ($user->roleOnProject($payment->project)?->hasPermission('payment.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('payment.create') ?? false);
    }

    public function update(User $user, Payment $payment): bool
    {
        if ($payment->status === \App\Enums\PaymentStatus::Refunded) {
            return false;
        }

        return $user->isOwnerOf($payment->project)
            || ($user->roleOnProject($payment->project)?->hasPermission('payment.update') ?? false);
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->isOwnerOf($payment->project)
            || ($user->roleOnProject($payment->project)?->hasPermission('payment.delete') ?? false);
    }

    public function refund(User $user, Payment $payment): bool
    {
        if ($payment->status === \App\Enums\PaymentStatus::Refunded) {
            return false;
        }

        return $payment->project_id
            && ($user->isOwnerOf($payment->project)
                || ($user->roleOnProject($payment->project)?->hasPermission('payment.refund') ?? false));
    }

    public function reinstate(User $user, Payment $payment): bool
    {
        if ($payment->status !== \App\Enums\PaymentStatus::Refunded) {
            return false;
        }

        return $payment->project_id
            && ($user->isOwnerOf($payment->project)
                || ($user->roleOnProject($payment->project)?->hasPermission('payment.refund') ?? false));
    }
}
