<?php

namespace App\Services;

use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\PosPayment;
use App\Models\PosSession;
use App\Models\Product;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PosService
{
    public function __construct(
        protected ActivityLogService $activityLogService,
        protected SaleService $saleService
    ) {}

    public function getOpenSession(Project $project): ?PosSession
    {
        return PosSession::forProject($project)
            ->where('status', 'open')
            ->where('user_id', auth()->id())
            ->latest('opened_at')
            ->first();
    }

    public function openSession(Project $project, float $openingCash = 0): PosSession
    {
        $existing = $this->getOpenSession($project);
        if ($existing) {
            throw new InvalidArgumentException('You already have an open session. Close it first.');
        }

        $session = PosSession::create([
            'project_id' => $project->id,
            'session_number' => $this->generateSessionNumber($project),
            'user_id' => auth()->id(),
            'opening_cash' => $openingCash,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $this->activityLogService->log(
            $project,
            'created',
            $session,
            null,
            $session->toArray(),
            'pos',
            "POS session #{$session->session_number} opened"
        );

        return $session;
    }

    public function closeSession(PosSession $session, float $closingCash): PosSession
    {
        if ($session->status !== 'open') {
            throw new InvalidArgumentException('Session is already closed.');
        }

        if ($session->user_id !== auth()->id()) {
            throw new InvalidArgumentException('You can only close your own session.');
        }

        $session->update([
            'closing_cash' => $closingCash,
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        $this->activityLogService->log(
            $session->project,
            'updated',
            $session,
            null,
            $session->fresh()->toArray(),
            'pos',
            "POS session #{$session->session_number} closed"
        );

        return $session->fresh();
    }

    /**
     * Create a POS order. Requires an open session.
     * If payments are provided and cover the total, the order is completed, synced to Sales and Payments.
     *
     * @param  array<int, array{product_id: int, quantity: int, unit_price: float}>  $items
     * @param  array<int, array{payment_method: string, amount: float, reference?: string}>  $payments
     */
    public function createOrder(Project $project, PosSession $session, array $items, float $discount = 0, array $payments = []): PosOrder
    {
        if ($session->status !== 'open') {
            throw new InvalidArgumentException('Cannot create order: no open session.');
        }

        if ($session->project_id !== $project->id) {
            throw new InvalidArgumentException('Session does not belong to this project.');
        }

        if (empty($items)) {
            throw new InvalidArgumentException('Order must have at least one item.');
        }

        return DB::transaction(function () use ($project, $session, $items, $discount, $payments) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $product = Product::forProject($project)->find($item['product_id']);
                if (!$product) {
                    throw new InvalidArgumentException("Product #{$item['product_id']} not found.");
                }

                $qty = (int) ($item['quantity'] ?? 0);
                if ($qty <= 0) {
                    continue;
                }

                $unitPrice = (float) ($item['unit_price'] ?? $product->price);
                $total = $qty * $unitPrice;
                $subtotal += $total;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ];
            }

            if (empty($orderItems)) {
                throw new InvalidArgumentException('Order must have at least one valid item.');
            }

            $total = $subtotal - $discount;

            $order = PosOrder::create([
                'project_id' => $project->id,
                'pos_session_id' => $session->id,
                'order_number' => $this->generateOrderNumber($project),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => 0,
                'total' => $total,
                'user_id' => auth()->id(),
            ]);

            foreach ($orderItems as $oi) {
                PosOrderItem::create([
                    'pos_order_id' => $order->id,
                    'product_id' => $oi['product_id'],
                    'quantity' => $oi['quantity'],
                    'unit_price' => $oi['unit_price'],
                    'total' => $oi['total'],
                ]);
            }

            foreach ($payments as $p) {
                $amount = (float) ($p['amount'] ?? 0);
                if ($amount > 0) {
                    PosPayment::create([
                        'project_id' => $project->id,
                        'pos_order_id' => $order->id,
                        'payment_method' => $p['payment_method'] ?? 'cash',
                        'amount' => $amount,
                        'reference' => $p['reference'] ?? null,
                        'user_id' => auth()->id(),
                    ]);
                }
            }

            $order->refresh();
            $totalDue = (float) $order->total;
            if ($totalDue > 0) {
                $this->syncToSaleAndComplete($order);
            }

            $this->activityLogService->log(
                $project,
                'created',
                $order,
                null,
                $order->load('items')->toArray(),
                'pos',
                "POS order #{$order->order_number} created"
            );

            return $order->load(['items.product', 'payments']);
        });
    }

    /**
     * Add payment to a POS order.
     */
    public function addPayment(PosOrder $order, string $paymentMethod, float $amount, ?string $reference = null): PosPayment
    {
        if ($order->status !== 'pending') {
            throw new InvalidArgumentException('Cannot add payment to a completed or cancelled order.');
        }

        $remaining = max(0, (float) $order->total - (float) $order->total_paid);
        if ($amount <= 0) {
            throw new InvalidArgumentException('Payment amount must be greater than zero.');
        }
        if ($amount > $remaining) {
            throw new InvalidArgumentException("Amount exceeds remaining due ({$remaining}).");
        }

        $payment = PosPayment::create([
            'project_id' => $order->project_id,
            'pos_order_id' => $order->id,
            'payment_method' => $paymentMethod,
            'amount' => $amount,
            'reference' => $reference,
            'user_id' => auth()->id(),
        ]);

        return $payment->load('posOrder');
    }

    /**
     * Complete order: mark as completed, create Sale, sync Payments, deduct stock.
     */
    public function completeOrder(PosOrder $order): PosOrder
    {
        if ($order->status !== 'pending') {
            throw new InvalidArgumentException('Order is already completed or cancelled.');
        }

        $totalPaid = (float) $order->total_paid;
        $totalDue = (float) $order->total;
        if ($totalPaid < $totalDue) {
            throw new InvalidArgumentException('Order must be fully paid before completion.');
        }

        return DB::transaction(function () use ($order) {
            $this->syncToSaleAndComplete($order);

            $this->activityLogService->log(
                $order->project,
                'updated',
                $order,
                ['status' => 'pending'],
                ['status' => 'completed'],
                'pos',
                "POS order #{$order->order_number} completed"
            );

            return $order->fresh(['items.product', 'payments', 'sale']);
        });
    }

    /**
     * Create Sale from POS order, sync to Payments table, deduct stock, mark order completed.
     */
    protected function syncToSaleAndComplete(PosOrder $order): void
    {
        $project = $order->project;

        $items = $order->items->map(fn ($i) => [
            'product_id' => $i->product_id,
            'quantity' => (int) $i->quantity,
            'unit_price' => (float) $i->unit_price,
        ])->toArray();

        $payments = $order->payments->map(fn ($p) => [
            'payment_method' => $p->payment_method,
            'amount' => (float) $p->amount,
            'reference' => $p->reference,
            'payment_date' => now()->format('Y-m-d'),
        ])->toArray();

        $sale = $this->saleService->create($project, [
            'subtotal' => (float) $order->subtotal,
            'discount' => (float) $order->discount,
            'tax' => 0,
            'total' => (float) $order->total,
            'status' => 'completed',
            'source' => 'pos',
        ], $items, $payments);

        $order->update(['status' => 'completed', 'sale_id' => $sale->id]);
    }

    public function cancelOrder(PosOrder $order): PosOrder
    {
        if ($order->status !== 'pending') {
            throw new InvalidArgumentException('Only pending orders can be cancelled.');
        }

        $order->update(['status' => 'cancelled']);

        $this->activityLogService->log(
            $order->project,
            'updated',
            $order,
            ['status' => 'pending'],
            ['status' => 'cancelled'],
            'pos',
            "POS order #{$order->order_number} cancelled"
        );

        return $order->fresh();
    }

    protected function generateSessionNumber(Project $project): string
    {
        // session_number has global unique constraint - count all sessions, not per project
        $count = PosSession::count() + 1;

        return 'SES-' . str_pad((string) $count, 6, '0', STR_PAD_LEFT);
    }

    protected function generateOrderNumber(Project $project): string
    {
        $count = PosOrder::forProject($project)->count() + 1;

        return 'POS-' . str_pad((string) $count, 6, '0', STR_PAD_LEFT);
    }
}
