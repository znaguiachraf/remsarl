<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\PurchaseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function __construct(
        protected PurchaseService $purchaseService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [PurchaseOrder::class, $project]);

        $orders = $this->purchaseService->list($project, [
            'status' => $request->get('status'),
            'supplier_id' => $request->get('supplier_id'),
            'search' => $request->get('search'),
            'per_page' => $request->get('per_page', 15),
        ]);

        $suppliers = Supplier::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $user = $request->user();

        return Inertia::render('Purchase/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'orders' => [
                'data' => $orders->map(fn ($o) => [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'status' => $o->status,
                    'supplier' => $o->supplier ? ['id' => $o->supplier->id, 'name' => $o->supplier->name] : null,
                    'total' => (float) $o->total,
                    'ordered_at' => $o->ordered_at?->format('Y-m-d'),
                    'bill_reference' => $o->bill_reference,
                    'can_update' => $user->can('update', $o),
                    'can_receive' => $user->can('receive', $o),
                ]),
                'links' => $orders->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
            ],
            'suppliers' => $suppliers->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values()->toArray(),
            'filters' => [
                'status' => $request->get('status'),
                'supplier_id' => $request->get('supplier_id'),
                'search' => $request->get('search'),
            ],
            'can' => [
                'create' => $user->can('create', [PurchaseOrder::class, $project]),
            ],
        ]);
    }

    public function create(Project $project): Response
    {
        $this->authorize('create', [PurchaseOrder::class, $project]);

        $suppliers = Supplier::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $products = Product::forProject($project)->where('is_active', true)->with('category')->orderBy('name')->get(['id', 'name', 'unit', 'cost_price', 'product_category_id']);

        return Inertia::render('Purchase/Create', [
            'project' => ['id' => $project->id, 'name' => $project->name],
            'suppliers' => $suppliers->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values()->toArray(),
            'products' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'unit' => $p->unit,
                'cost_price' => (float) $p->cost_price,
                'category' => $p->category ? ['name' => $p->category->name] : null,
            ])->values()->toArray(),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [PurchaseOrder::class, $project]);

        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'ordered_at' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $this->ensureResourceBelongsToProject($project, $validated['supplier_id'] ?? null, 'suppliers');
        foreach ($validated['items'] as $item) {
            $this->ensureResourceBelongsToProject($project, $item['product_id'], 'products');
        }

        $order = $this->purchaseService->create($project, $validated, $request->user()?->id);

        return redirect()->route('projects.modules.purchase.show', [$project, $order])
            ->with('success', 'Purchase order created.');
    }

    public function show(Project $project, PurchaseOrder $order): Response
    {
        $this->authorize('view', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        $order->load(['items.product', 'supplier', 'user']);
        $locations = Location::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        $user = request()->user();

        return Inertia::render('Purchase/Show', [
            'project' => ['id' => $project->id, 'name' => $project->name],
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'supplier' => $order->supplier ? [
                    'id' => $order->supplier->id,
                    'name' => $order->supplier->name,
                    'phone' => $order->supplier->phone,
                    'email' => $order->supplier->email,
                ] : null,
                'subtotal' => (float) $order->subtotal,
                'tax' => (float) $order->tax,
                'total' => (float) $order->total,
                'bill_reference' => $order->bill_reference,
                'bill_amount' => $order->bill_amount ? (float) $order->bill_amount : null,
                'ordered_at' => $order->ordered_at?->format('Y-m-d'),
                'notes' => $order->notes,
                'items' => $order->items->map(fn ($i) => [
                    'id' => $i->id,
                    'product' => ['id' => $i->product->id, 'name' => $i->product->name, 'unit' => $i->product->unit],
                    'quantity_ordered' => $i->quantity_ordered,
                    'quantity_received' => $i->quantity_received,
                    'quantity_remaining' => $i->quantity_ordered - $i->quantity_received,
                    'unit_cost' => (float) $i->unit_cost,
                    'line_total' => (float) $i->line_total,
                ])->values()->toArray(),
                'can_update' => $user->can('update', $order),
                'can_receive' => $user->can('receive', $order),
            ],
            'locations' => $locations->map(fn ($l) => ['id' => $l->id, 'name' => $l->name, 'code' => $l->code])->values()->toArray(),
        ]);
    }

    public function edit(Project $project, PurchaseOrder $order): Response|RedirectResponse
    {
        $this->authorize('update', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        if ($order->status !== 'draft') {
            return redirect()->route('projects.modules.purchase.show', [$project, $order])
                ->with('error', 'Only draft orders can be edited.');
        }

        $order->load(['items.product', 'supplier']);
        $suppliers = Supplier::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $products = Product::forProject($project)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'unit', 'cost_price']);

        return Inertia::render('Purchase/Edit', [
            'project' => ['id' => $project->id, 'name' => $project->name],
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'supplier_id' => $order->supplier_id,
                'ordered_at' => $order->ordered_at?->format('Y-m-d'),
                'notes' => $order->notes,
                'items' => $order->items->map(fn ($i) => [
                    'id' => $i->id,
                    'product_id' => $i->product_id,
                    'product_name' => $i->product->name,
                    'unit' => $i->product->unit,
                    'quantity_ordered' => $i->quantity_ordered,
                    'unit_cost' => (float) $i->unit_cost,
                ])->values()->toArray(),
            ],
            'suppliers' => $suppliers->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values()->toArray(),
            'products' => $products->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'unit' => $p->unit, 'cost_price' => (float) $p->cost_price])->values()->toArray(),
        ]);
    }

    public function update(Request $request, Project $project, PurchaseOrder $order)
    {
        $this->authorize('update', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'ordered_at' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $this->purchaseService->update($order, $validated);

        return redirect()->route('projects.modules.purchase.show', [$project, $order])
            ->with('success', 'Purchase order updated.');
    }

    public function receive(Request $request, Project $project, PurchaseOrder $order)
    {
        $this->authorize('receive', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        $validated = $request->validate([
            'location_id' => 'nullable|exists:locations,id',
            'receipts' => 'required|array|min:1',
            'receipts.*.item_id' => 'required|exists:purchase_order_items,id',
            'receipts.*.quantity' => 'required|integer|min:1',
        ]);

        $this->ensureResourceBelongsToProject($project, $validated['location_id'] ?? null, 'locations');

        $this->purchaseService->receive(
            $project,
            $order,
            $validated['receipts'],
            $validated['location_id'] ?? null,
            $request->user()?->id
        );

        return back()->with('success', 'Receipt recorded.');
    }

    public function updateBill(Request $request, Project $project, PurchaseOrder $order)
    {
        $this->authorize('update', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        $validated = $request->validate([
            'bill_reference' => 'nullable|string|max:100',
            'bill_amount' => 'nullable|numeric|min:0',
        ]);

        $this->purchaseService->updateBill(
            $order,
            $validated['bill_reference'] ?? null,
            isset($validated['bill_amount']) ? (float) $validated['bill_amount'] : null
        );

        return back()->with('success', 'Bill reference updated.');
    }

    public function send(Project $project, PurchaseOrder $order)
    {
        $this->authorize('update', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        $this->purchaseService->send($order);

        return back()->with('success', 'Purchase order sent.');
    }

    public function cancel(Project $project, PurchaseOrder $order)
    {
        $this->authorize('update', $order);
        $this->ensureOrderBelongsToProject($project, $order);

        $this->purchaseService->cancel($order);

        return back()->with('success', 'Purchase order cancelled.');
    }

    protected function ensureOrderBelongsToProject(Project $project, PurchaseOrder $order): void
    {
        if ($order->project_id !== $project->id) {
            abort(403, 'Purchase order does not belong to this project.');
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
