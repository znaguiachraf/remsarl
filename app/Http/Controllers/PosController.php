<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\PosOrder;
use App\Models\PosSession;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use App\Services\PosService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(
        protected PosService $posService
    ) {}

    public function index(Project $project): Response
    {
        $session = $this->posService->getOpenSession($project);

        $products = Product::forProject($project)
            ->where('is_active', true)
            ->with(['category'])
            ->withSum('stockMovements', 'quantity')
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'unit', 'product_category_id']);

        $categories = ProductCategory::forProject($project)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $products = $products->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'price' => (float) $p->price,
            'unit' => $p->unit,
            'stock' => (int) ($p->stock_movements_sum_quantity ?? 0),
            'category_id' => $p->product_category_id,
            'category_name' => $p->category?->name ?? null,
        ])->values()->toArray();

        $categories = $categories->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'color' => $c->color,
        ])->values()->toArray();

        $user = request()->user();

        return Inertia::render('Pos/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'session' => $session ? [
                'id' => $session->id,
                'session_number' => $session->session_number,
                'status' => $session->status,
                'opening_cash' => (float) $session->opening_cash,
                'opened_at' => $session->opened_at->toISOString(),
            ] : null,
            'products' => $products,
            'categories' => $categories,
            'can' => [
                'open_session' => $user->can('pos.openSession', $project),
                'close_session' => $session ? $user->can('closeSession', $session) : false,
                'create_order' => $session && $user->can('pos.createOrder', $project),
            ],
        ]);
    }

    public function openSession(Request $request, Project $project)
    {
        $this->authorize('pos.openSession', $project);

        $validated = $request->validate([
            'opening_cash' => 'nullable|numeric|min:0',
        ]);

        try {
            $this->posService->openSession($project, (float) ($validated['opening_cash'] ?? 0));
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['session' => $e->getMessage()]);
        }

        return back()->with('success', 'Session opened.');
    }

    public function closeSession(Request $request, Project $project, PosSession $posSession)
    {
        $this->authorize('closeSession', $posSession);

        if ($posSession->project_id !== $project->id) {
            abort(403, 'Session does not belong to this project.');
        }

        $validated = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
        ]);

        try {
            $this->posService->closeSession($posSession, (float) $validated['closing_cash']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['session' => $e->getMessage()]);
        }

        return back()->with('success', 'Session closed.');
    }

    public function createOrder(Request $request, Project $project)
    {
        $session = $this->posService->getOpenSession($project);
        if (!$session) {
            return back()->withErrors(['session' => 'No open session. Open a session first.']);
        }

        $this->authorize('pos.createOrder', $project);

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
        ]);

        $payments = array_map(fn ($p) => [
            'payment_method' => $p['payment_method'],
            'amount' => (float) $p['amount'],
            'reference' => $p['reference'] ?? null,
        ], $validated['payments'] ?? []);

        try {
            $order = $this->posService->createOrder(
                $project,
                $session,
                $validated['items'],
                (float) ($validated['discount'] ?? 0),
                $payments
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['order' => $e->getMessage()]);
        }

        return back()->with(['success' => 'Order created.', 'last_order_id' => $order->id]);
    }

    public function addPayment(Request $request, Project $project, PosOrder $order)
    {
        if ($order->project_id !== $project->id) {
            abort(403, 'Order does not belong to this project.');
        }

        $this->authorize('payOrder', $order);

        $validated = $request->validate([
            'payment_method' => 'required|string|' . PaymentMethod::validationRule(),
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
        ]);

        try {
            $this->posService->addPayment(
                $order,
                $validated['payment_method'],
                (float) $validated['amount'],
                $validated['reference'] ?? null
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }

        return back()->with('success', 'Payment added.');
    }

    public function completeOrder(Project $project, PosOrder $order)
    {
        if ($order->project_id !== $project->id) {
            abort(403, 'Order does not belong to this project.');
        }

        try {
            $this->posService->completeOrder($order);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['order' => $e->getMessage()]);
        }

        return back()->with('success', 'Order completed. Stock updated.');
    }

    public function cancelOrder(Project $project, PosOrder $order)
    {
        if ($order->project_id !== $project->id) {
            abort(403, 'Order does not belong to this project.');
        }

        try {
            $this->posService->cancelOrder($order);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['order' => $e->getMessage()]);
        }

        return back()->with('success', 'Order cancelled.');
    }
}
