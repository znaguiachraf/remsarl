<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\Project;
use App\Models\User;

class ContractPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('contract.view') ?? false);
    }

    public function view(User $user, Contract $contract): bool
    {
        return $user->isOwnerOf($contract->project)
            || ($user->roleOnProject($contract->project)?->hasPermission('contract.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('contract.create') ?? false);
    }

    public function update(User $user, Contract $contract): bool
    {
        return $user->isOwnerOf($contract->project)
            || ($user->roleOnProject($contract->project)?->hasPermission('contract.update') ?? false);
    }

    public function delete(User $user, Contract $contract): bool
    {
        return $user->isOwnerOf($contract->project)
            || ($user->roleOnProject($contract->project)?->hasPermission('contract.delete') ?? false);
    }
}
