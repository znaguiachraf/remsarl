<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\Product;
use App\Models\Project;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(
        protected SaleService $saleService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Sale::class, $project]);

        $sales = $this->saleService->list($project, [
            'status' => $request->get('status'),
            'payment_status' => $request->get('payment_status'),
            'from_date' => $request->get('from_date'),
            'to_date' => $request->get('to_date'),
            'per_page' => $request->get('per_page', 15),
        ]);

        $user = $request->user();

        return Inertia::render('Sales/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'sales' => [
                'data' => $sales->map(fn ($s) => $this->formatSale($s, $user)),
                'links' => $sales->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $sales->currentPage(),
                    'last_page' => $sales->lastPage(),
                    'per_page' => $sales->perPage(),
                    'total' => $sales->total(),
                ],
            ],
            'filters' => [
                'status' => $request->get('status'),
                'payment_status' => $request->get('payment_status'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ],
            'can' => [
                'create' => $user->can('create', [Sale::class, $project]),
            ],
        ]);
    }

    public function create(Project $project): Response
    {
        $this->authorize('create', [Sale::class, $project]);

        $products = Product::forProject($project)
            ->where('is_active', true)
            ->withSum('stockMovements', 'quantity')
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'unit']);

        return Inertia::render('Sales/Create', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'products' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => (float) $p->price,
                'unit' => $p->unit,
                'stock' => (int) ($p->stock_movements_sum_quantity ?? 0),
            ])->values()->toArray(),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Sale::class, $project]);

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'payments' => 'nullable|array',
            'payments.*.payment_method' => 'required|string|' . PaymentMethod::validationRule(),
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.reference' => 'nullable|string|max:100',
            'payments.*.payment_date' => 'nullable|date',
        ]);

        $items = $validated['items'];
        $subtotal = collect($items)->sum(fn ($i) => $i['quantity'] * $i['unit_price']);
        $discount = (float) ($validated['discount'] ?? 0);
        $total = $subtotal - $discount;

        $payments = array_map(fn ($p) => [
            'payment_method' => $p['payment_method'],
            'amount' => (float) $p['amount'],
            'reference' => $p['reference'] ?? null,
            'payment_date' => $p['payment_date'] ?? now()->format('Y-m-d'),
        ], $validated['payments'] ?? []);

        $this->ensureProductsBelongToProject($project, $items);

        $sale = $this->saleService->create($project, [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => 0,
            'total' => $total,
            'source' => 'manual',
        ], $items, $payments);

        return redirect()
            ->route('projects.modules.sales.show', [$project->id, $sale->id])
            ->with('success', 'Sale created.');
    }

    public function show(Project $project, Sale $sale): Response
    {
        $this->authorize('view', $sale);
        $this->ensureSaleBelongsToProject($project, $sale);

        $sale->load(['saleItems.product', 'payments', 'user', 'invoice']);
        $user = request()->user();

        return Inertia::render('Sales/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'sale' => $this->formatSaleDetail($sale, $user),
            'can' => [
                'update' => $user->can('update', $sale),
                'pay' => $user->can('pay', $sale),
            ],
        ]);
    }

    public function pay(Request $request, Project $project, Sale $sale)
    {
        $this->authorize('pay', $sale);
        $this->ensureSaleBelongsToProject($project, $sale);

        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,card,transfer,check,other',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $this->saleService->addPayment($sale, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return back()->with('success', 'Payment recorded.');
    }

    protected function formatSale(Sale $s, $user): array
    {
        return [
            'id' => $s->id,
            'sale_number' => $s->sale_number,
            'status' => $s->status,
            'payment_status' => $s->payment_status,
            'subtotal' => (float) $s->subtotal,
            'discount' => (float) $s->discount,
            'tax' => (float) $s->tax,
            'total' => (float) $s->total,
            'total_paid' => (float) $s->total_paid,
            'remaining' => max(0, (float) $s->total - (float) $s->total_paid),
            'created_at' => $s->created_at->toISOString(),
            'user' => $s->user ? ['name' => $s->user->name] : null,
            'items_count' => $s->saleItems->count(),
        ];
    }

    protected function formatSaleDetail(Sale $s, $user): array
    {
        return [
            'id' => $s->id,
            'sale_number' => $s->sale_number,
            'status' => $s->status,
            'payment_status' => $s->payment_status,
            'subtotal' => (float) $s->subtotal,
            'discount' => (float) $s->discount,
            'tax' => (float) $s->tax,
            'total' => (float) $s->total,
            'total_paid' => (float) $s->total_paid,
            'remaining' => max(0, (float) $s->total - (float) $s->total_paid),
            'created_at' => $s->created_at->toISOString(),
            'user' => $s->user ? ['name' => $s->user->name] : null,
            'items' => $s->saleItems->map(fn ($i) => [
                'id' => $i->id,
                'product_id' => $i->product_id,
                'product_name' => $i->product?->name,
                'quantity' => $i->quantity,
                'unit_price' => (float) $i->unit_price,
                'total' => (float) $i->total,
            ])->values()->toArray(),
            'invoice' => $s->invoice ? [
                'id' => $s->invoice->id,
                'invoice_number' => $s->invoice->invoice_number,
                'total_amount' => (float) $s->invoice->total_amount,
                'status' => $s->invoice->status,
            ] : null,
            'payments' => $s->payments->map(fn ($p) => [
                'id' => $p->id,
                'payment_method' => $p->payment_method,
                'amount' => (float) $p->amount,
                'reference' => $p->reference,
                'payment_date' => $p->payment_date->format('Y-m-d'),
                'status' => $p->status->value,
                'user' => $p->user ? ['name' => $p->user->name] : null,
                'created_at' => $p->created_at->toISOString(),
            ])->values()->toArray(),
        ];
    }

    protected function ensureSaleBelongsToProject(Project $project, Sale $sale): void
    {
        if ($sale->project_id !== $project->id) {
            abort(403, 'Sale does not belong to this project.');
        }
    }

    protected function ensureProductsBelongToProject(Project $project, array $items): void
    {
        $productIds = array_column($items, 'product_id');
        $count = Product::forProject($project)->whereIn('id', $productIds)->count();
        if ($count !== count(array_unique($productIds))) {
            abort(403, 'One or more products do not belong to this project.');
        }
    }
}
