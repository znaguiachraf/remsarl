<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Project;
use App\Models\StockMovement;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StockService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * List products with stock levels and low-stock alerts.
     */
    public function listProductsWithStock(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Product::forProject($project)
            ->with(['category', 'supplier'])
            ->withSum('stockMovements', 'quantity')
            ->orderBy('name');

        if (!empty($filters['category_id'])) {
            $query->where('product_category_id', $filters['category_id']);
        }
        if (isset($filters['low_stock']) && $filters['low_stock']) {
            $query->whereRaw('products.minimum_stock > 0 AND (SELECT COALESCE(SUM(quantity), 0) FROM stock_movements WHERE stock_movements.product_id = products.id) < products.minimum_stock');
        }
        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $query->paginate($filters['per_page'] ?? 20)->withQueryString();
    }

    /**
     * Get stock movement history.
     */
    public function listMovements(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = StockMovement::forProject($project)
            ->with(['product', 'user', 'sale'])
            ->orderByDesc('created_at');

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->paginate($filters['per_page'] ?? 25)->withQueryString();
    }

    /**
     * Manual stock adjustment.
     */
    public function adjust(Project $project, Product $product, int $quantity, string $reason = '', ?float $unitCost = null): StockMovement
    {
        if ($product->project_id !== $project->id) {
            throw new InvalidArgumentException('Product does not belong to this project.');
        }

        if ($quantity === 0) {
            throw new InvalidArgumentException('Quantity cannot be zero.');
        }

        $currentStock = (int) $product->stockMovements()->sum('quantity');
        $newStock = $currentStock + $quantity;

        if ($newStock < 0) {
            throw new InvalidArgumentException("Insufficient stock. Current: {$currentStock}, requested adjustment: {$quantity}.");
        }

        return DB::transaction(function () use ($project, $product, $quantity, $reason, $unitCost) {
            $type = $quantity > 0 ? 'in' : 'out';
            $movement = StockMovement::create([
                'project_id' => $project->id,
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $quantity,
                'unit_cost' => $unitCost ?? $product->cost_price,
                'reference' => 'Manual adjustment',
                'reason' => $reason ?: 'Manual adjustment',
                'user_id' => auth()->id(),
            ]);

            $this->activityLogService->log(
                $project,
                'created',
                $movement,
                null,
                $movement->toArray(),
                'stock',
                "Stock adjustment: {$product->name} {$type} {$quantity}"
            );

            return $movement->load(['product', 'user']);
        });
    }

    /**
     * Record stock outflow for a sale. Called from SaleService.
     */
    public function recordSaleOutflow(Project $project, int $saleId, array $items): void
    {
        DB::transaction(function () use ($project, $saleId, $items) {
            foreach ($items as $item) {
                $product = Product::forProject($project)->find($item['product_id']);
                if (!$product) {
                    continue;
                }

                $quantity = (int) ($item['quantity'] ?? 0);
                if ($quantity <= 0) {
                    continue;
                }

                StockMovement::create([
                    'project_id' => $project->id,
                    'product_id' => $product->id,
                    'sale_id' => $saleId,
                    'type' => 'out',
                    'quantity' => -$quantity,
                    'unit_cost' => $product->cost_price,
                    'reference' => 'Sale',
                    'reason' => 'Sale',
                    'user_id' => auth()->id(),
                ]);
            }
        });
    }
}
