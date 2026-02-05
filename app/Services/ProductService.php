<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    public function list(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Product::forProject($project)
            ->with(['category', 'supplier'])
            ->withSum('stockMovements', 'quantity')
            ->orderBy('name');

        if (!empty($filters['category_id'])) {
            $query->where('product_category_id', $filters['category_id']);
        }
        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $query->paginate($filters['per_page'] ?? 15)->withQueryString();
    }
}
