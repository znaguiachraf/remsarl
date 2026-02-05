<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\Project;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('product.view') ?? false);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->isOwnerOf($product->project)
            || ($user->roleOnProject($product->project)?->hasPermission('product.view') ?? false);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('product.create') ?? false);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isOwnerOf($product->project)
            || ($user->roleOnProject($product->project)?->hasPermission('product.update') ?? false);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->isOwnerOf($product->project)
            || ($user->roleOnProject($product->project)?->hasPermission('product.delete') ?? false);
    }

    public function manageCategories(User $user, Project $project): bool
    {
        return $user->isOwnerOf($project)
            || ($user->roleOnProject($project)?->hasPermission('product.update') ?? false);
    }
}
