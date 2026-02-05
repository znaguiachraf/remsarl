<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class StockController extends Controller
{
    public function __construct(
        protected StockService $stockService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [StockMovement::class, $project]);

        $products = $this->stockService->listProductsWithStock($project, [
            'category_id' => $request->get('category_id'),
            'low_stock' => $request->boolean('low_stock'),
            'is_active' => $request->get('is_active'),
            'per_page' => $request->get('per_page', 20),
        ]);

        $categories = ProductCategory::forProject($project)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $user = $request->user();

        return Inertia::render('Stock/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'products' => [
                'data' => $products->map(fn ($p) => $this->formatProductStock($p, $user)),
                'links' => $products->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ],
            ],
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'color' => $c->color,
            ])->values()->toArray(),
            'filters' => [
                'category_id' => $request->get('category_id'),
                'low_stock' => $request->boolean('low_stock'),
                'is_active' => $request->get('is_active'),
            ],
            'can' => [
                'adjust' => $user->can('adjust', [StockMovement::class, $project]),
                'viewHistory' => $user->can('viewHistory', [StockMovement::class, $project]),
            ],
        ]);
    }

    public function movements(Project $project, Request $request): Response
    {
        $this->authorize('viewHistory', [StockMovement::class, $project]);

        $movements = $this->stockService->listMovements($project, [
            'product_id' => $request->get('product_id'),
            'type' => $request->get('type'),
            'from_date' => $request->get('from_date'),
            'to_date' => $request->get('to_date'),
            'per_page' => $request->get('per_page', 25),
        ]);

        $products = Product::forProject($project)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Stock/Movements', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'movements' => [
                'data' => $movements->map(fn ($m) => [
                    'id' => $m->id,
                    'product_id' => $m->product_id,
                    'product_name' => $m->product?->name,
                    'type' => $m->type,
                    'quantity' => $m->quantity,
                    'unit_cost' => $m->unit_cost ? (float) $m->unit_cost : null,
                    'reference' => $m->reference,
                    'reason' => $m->reason,
                    'sale' => $m->sale ? ['id' => $m->sale->id, 'sale_number' => $m->sale->sale_number] : null,
                    'user' => $m->user ? ['id' => $m->user->id, 'name' => $m->user->name] : null,
                    'created_at' => $m->created_at->toISOString(),
                ]),
                'links' => $movements->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                    'per_page' => $movements->perPage(),
                    'total' => $movements->total(),
                ],
            ],
            'products' => $products->map(fn ($p) => ['id' => $p->id, 'name' => $p->name])->values()->toArray(),
            'filters' => [
                'product_id' => $request->get('product_id'),
                'type' => $request->get('type'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ],
        ]);
    }

    public function adjust(Request $request, Project $project, Product $product)
    {
        $this->authorize('adjust', [StockMovement::class, $project]);
        $this->ensureProductBelongsToProject($project, $product);

        $validated = $request->validate([
            'quantity' => 'required|integer',
            'reason' => 'nullable|string|max:255',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        try {
            $this->stockService->adjust(
                $project,
                $product,
                (int) $validated['quantity'],
                $validated['reason'] ?? '',
                isset($validated['unit_cost']) ? (float) $validated['unit_cost'] : null
            );
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['quantity' => $e->getMessage()]);
        }

        return back()->with('success', 'Stock adjusted successfully.');
    }

    protected function formatProductStock(Product $p, $user): array
    {
        $stockQuantity = (int) ($p->stock_movements_sum_quantity ?? 0);
        $minimumStock = (int) ($p->minimum_stock ?? 0);
        $isLowStock = $minimumStock > 0 && $stockQuantity < $minimumStock;

        return [
            'id' => $p->id,
            'name' => $p->name,
            'unit' => $p->unit,
            'stock_quantity' => $stockQuantity,
            'minimum_stock' => $minimumStock,
            'is_low_stock' => $isLowStock,
            'category' => $p->category ? [
                'id' => $p->category->id,
                'name' => $p->category->name,
                'color' => $p->category->color,
            ] : null,
            'supplier' => $p->supplier ? [
                'id' => $p->supplier->id,
                'name' => $p->supplier->name,
            ] : null,
            'can_adjust' => $user->can('adjust', [StockMovement::class, $p->project]),
        ];
    }

    protected function ensureProductBelongsToProject(Project $project, Product $product): void
    {
        if ($product->project_id !== $project->id) {
            abort(403, 'Product does not belong to this project.');
        }
    }
}
