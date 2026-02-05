<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use App\Models\Supplier;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Product::class, $project]);

        $products = $this->productService->list($project, [
            'category_id' => $request->get('category_id'),
            'is_active' => $request->get('is_active'),
            'per_page' => $request->get('per_page', 15),
        ]);

        $categories = ProductCategory::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'color']);
        $suppliers = Supplier::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        $user = $request->user();

        return Inertia::render('Products/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'products' => [
                'data' => $products->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'barcode' => $p->barcode,
                    'description' => $p->description,
                    'price' => (float) $p->price,
                    'cost_price' => $p->cost_price ? (float) $p->cost_price : null,
                    'unit' => $p->unit,
                    'is_active' => $p->is_active,
                    'stock_quantity' => (int) ($p->stock_movements_sum_quantity ?? 0),
                    'category' => $p->category ? [
                        'id' => $p->category->id,
                        'name' => $p->category->name,
                        'color' => $p->category->color,
                    ] : null,
                    'supplier' => $p->supplier ? [
                        'id' => $p->supplier->id,
                        'name' => $p->supplier->name,
                    ] : null,
                    'can_update' => $user->can('update', $p),
                    'can_delete' => $user->can('delete', $p),
                ]),
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
            'suppliers' => $suppliers->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
            ])->values()->toArray(),
            'filters' => [
                'category_id' => $request->get('category_id'),
                'is_active' => $request->get('is_active'),
            ],
            'can' => [
                'create' => $user->can('create', [Product::class, $project]),
                'manageCategories' => $user->can('manageCategories', [Product::class, $project]),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Product::class, $project]);

        $request->merge([
            'product_category_id' => $request->input('product_category_id') ?: null,
            'supplier_id' => $request->input('supplier_id') ?: null,
        ]);

        $validated = $request->validate([
            'product_category_id' => 'nullable|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:20',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'is_active' => 'boolean',
        ]);

        $this->ensureResourceBelongsToProject($project, $validated['product_category_id'] ?? null, 'product_categories');
        $this->ensureResourceBelongsToProject($project, $validated['supplier_id'] ?? null, 'suppliers');

        Product::create([
            'project_id' => $project->id,
            'product_category_id' => $validated['product_category_id'] ?? null,
            'name' => $validated['name'],
            'barcode' => $validated['barcode'] ?? null,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'cost_price' => $validated['cost_price'] ?? null,
            'unit' => $validated['unit'] ?? 'pcs',
            'supplier_id' => $validated['supplier_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Product created.');
    }

    public function update(Request $request, Project $project, Product $product)
    {
        $this->authorize('update', $product);
        $this->ensureProductBelongsToProject($project, $product);

        $request->merge([
            'product_category_id' => $request->input('product_category_id') ?: null,
            'supplier_id' => $request->input('supplier_id') ?: null,
        ]);

        $validated = $request->validate([
            'product_category_id' => 'nullable|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:20',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'is_active' => 'boolean',
        ]);

        $this->ensureResourceBelongsToProject($project, $validated['product_category_id'] ?? null, 'product_categories');
        $this->ensureResourceBelongsToProject($project, $validated['supplier_id'] ?? null, 'suppliers');

        $product->update([
            'product_category_id' => $validated['product_category_id'] ?? null,
            'name' => $validated['name'],
            'barcode' => $validated['barcode'] ?? null,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'cost_price' => $validated['cost_price'] ?? null,
            'unit' => $validated['unit'] ?? 'pcs',
            'supplier_id' => $validated['supplier_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Product updated.');
    }

    public function destroy(Project $project, Product $product)
    {
        $this->authorize('delete', $product);
        $this->ensureProductBelongsToProject($project, $product);

        $product->delete();

        return back()->with('success', 'Product deleted.');
    }

    protected function ensureProductBelongsToProject(Project $project, Product $product): void
    {
        if ($product->project_id !== $project->id) {
            abort(403, 'Product does not belong to this project.');
        }
    }

    protected function ensureResourceBelongsToProject(Project $project, ?int $resourceId, string $table): void
    {
        if (!$resourceId) {
            return;
        }
        $exists = DB::table($table)->where('id', $resourceId)->where('project_id', $project->id)->exists();
        if (!$exists) {
            abort(403, 'Resource does not belong to this project.');
        }
    }
}
