<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PurchaseService
{
    public function list(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = PurchaseOrder::forProject($project)
            ->with(['supplier', 'user'])
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($s) => $s->where('name', 'like', "%{$search}%"));
            });
        }

        return $query->paginate($filters['per_page'] ?? 15)->withQueryString();
    }

    public function create(Project $project, array $data, ?int $userId = null): PurchaseOrder
    {
        $orderNumber = $this->generateOrderNumber($project);

        $order = PurchaseOrder::create([
            'project_id' => $project->id,
            'order_number' => $orderNumber,
            'status' => 'draft',
            'supplier_id' => $data['supplier_id'] ?? null,
            'user_id' => $userId,
            'ordered_at' => $data['ordered_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $this->addItemToOrder($order, $item);
            }
        }

        return $this->recalculateTotals($order->fresh(['items.product', 'supplier']));
    }

    public function update(PurchaseOrder $order, array $data): PurchaseOrder
    {
        if (!in_array($order->status, ['draft'])) {
            throw new InvalidArgumentException('Only draft orders can be updated.');
        }

        $order->update([
            'supplier_id' => $data['supplier_id'] ?? $order->supplier_id,
            'ordered_at' => $data['ordered_at'] ?? $order->ordered_at,
            'notes' => $data['notes'] ?? $order->notes,
        ]);

        if (isset($data['items'])) {
            $order->items()->delete();
            foreach ($data['items'] as $item) {
                $this->addItemToOrder($order, $item);
            }
        }

        return $this->recalculateTotals($order->fresh(['items.product', 'supplier']));
    }

    public function receive(Project $project, PurchaseOrder $order, array $receipts, ?int $locationId = null, ?int $userId = null): PurchaseOrder
    {
        if ($order->project_id !== $project->id) {
            throw new InvalidArgumentException('Purchase order does not belong to this project.');
        }

        if (in_array($order->status, ['cancelled'])) {
            throw new InvalidArgumentException('Cannot receive a cancelled order.');
        }

        DB::transaction(function () use ($order, $receipts, $locationId, $userId) {
            foreach ($receipts as $receipt) {
                $itemId = $receipt['item_id'] ?? null;
                $qty = (int) ($receipt['quantity'] ?? 0);
                if (!$itemId || $qty <= 0) {
                    continue;
                }

                $item = PurchaseOrderItem::where('purchase_order_id', $order->id)
                    ->where('id', $itemId)
                    ->first();
                if (!$item) {
                    continue;
                }

                $remaining = $item->quantity_ordered - $item->quantity_received;
                $toReceive = min($qty, $remaining);
                if ($toReceive <= 0) {
                    continue;
                }

                $item->increment('quantity_received', $toReceive);

                StockMovement::create([
                    'project_id' => $order->project_id,
                    'product_id' => $item->product_id,
                    'purchase_order_id' => $order->id,
                    'location_id' => $locationId,
                    'type' => 'in',
                    'quantity' => $toReceive,
                    'unit_cost' => $item->unit_cost,
                    'reference' => "PO-{$order->order_number}",
                    'reason' => 'purchase_receive',
                    'user_id' => $userId,
                ]);
            }

            $this->recalculateTotals($order->fresh());
            $this->updateOrderStatus($order->fresh());
        });

        return $order->fresh(['items.product', 'supplier']);
    }

    public function updateBill(PurchaseOrder $order, ?string $billReference = null, ?float $billAmount = null): PurchaseOrder
    {
        $order->update([
            'bill_reference' => $billReference ?? $order->bill_reference,
            'bill_amount' => $billAmount ?? $order->bill_amount,
        ]);

        return $order->fresh();
    }

    public function send(PurchaseOrder $order): PurchaseOrder
    {
        if ($order->status !== 'draft') {
            throw new InvalidArgumentException('Only draft orders can be sent.');
        }

        if ($order->items()->count() === 0) {
            throw new InvalidArgumentException('Order must have at least one item.');
        }

        $order->update([
            'status' => 'sent',
            'ordered_at' => $order->ordered_at ?? now(),
        ]);

        return $order->fresh();
    }

    public function cancel(PurchaseOrder $order): PurchaseOrder
    {
        if (!in_array($order->status, ['draft', 'sent'])) {
            throw new InvalidArgumentException('Only draft or sent orders can be cancelled.');
        }

        if ($order->items()->where('quantity_received', '>', 0)->exists()) {
            throw new InvalidArgumentException('Cannot cancel order with received items.');
        }

        $order->update(['status' => 'cancelled']);

        return $order->fresh();
    }

    protected function addItemToOrder(PurchaseOrder $order, array $itemData): void
    {
        $product = Product::findOrFail($itemData['product_id']);
        $qty = (int) ($itemData['quantity_ordered'] ?? 0);
        $unitCost = (float) ($itemData['unit_cost'] ?? $product->cost_price ?? 0);

        PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'product_id' => $product->id,
            'quantity_ordered' => $qty,
            'quantity_received' => 0,
            'unit_cost' => $unitCost,
            'line_total' => $qty * $unitCost,
        ]);
    }

    protected function recalculateTotals(PurchaseOrder $order): PurchaseOrder
    {
        $order->load('items');
        $subtotal = $order->items->sum('line_total');
        $tax = 0;
        $order->update([
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $subtotal + $tax,
        ]);

        return $order->fresh();
    }

    protected function updateOrderStatus(PurchaseOrder $order): void
    {
        $order->load('items');
        $fullyReceived = $order->items->every(fn ($i) => $i->quantity_received >= $i->quantity_ordered);
        $hasReceipt = $order->items->contains(fn ($i) => $i->quantity_received > 0);

        $status = match (true) {
            $fullyReceived => 'received',
            $hasReceipt => 'partial',
            $order->status === 'draft' => 'draft',
            default => 'sent',
        };

        $order->update(['status' => $status]);
    }

    protected function generateOrderNumber(Project $project): string
    {
        $max = PurchaseOrder::forProject($project)->max(DB::raw('CAST(SUBSTRING(order_number, 4) AS UNSIGNED)'));
        $next = ($max ?? 0) + 1;

        return 'PO-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }
}
