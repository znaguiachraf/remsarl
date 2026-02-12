<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SaleService
{
    public function __construct(
        protected PaymentService $paymentService,
        protected StockService $stockService,
        protected ActivityLogService $activityLogService
    ) {}

    public function list(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Sale::forProject($project)
            ->with(['saleItems.product', 'payments', 'user'])
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        $paginator = $query->paginate($filters['per_page'] ?? 15)->withQueryString();

        if (!empty($filters['payment_status']) && in_array($filters['payment_status'], ['unpaid', 'partial', 'paid'])) {
            $all = $paginator->getCollection();
            $filtered = $all->filter(fn ($s) => $s->payment_status === $filters['payment_status']);
            $perPage = $paginator->perPage();
            $page = $paginator->currentPage();
            $paginator->setCollection($filtered->forPage($page, $perPage)->values());
            $paginator->setTotal($filtered->count());
        }

        return $paginator;
    }

    public function find(Project $project, int $id): ?Sale
    {
        return Sale::forProject($project)
            ->with(['saleItems.product', 'payments', 'user'])
            ->find($id);
    }

    /**
     * Create a sale (invoice/order). Payments optional for unpaid/partial.
     *
     * @param  array<int, array{product_id: int, quantity: int, unit_price: float}>  $items  Sale line items. Stock is auto-deducted.
     * @param  array<int, array{payment_method: string, amount: float, reference?: string, payment_date?: string, notes?: string}>  $payments  Payment data. Omit for unpaid sale.
     */
    public function create(Project $project, array $saleData, array $items = [], array $payments = []): Sale
    {
        return DB::transaction(function () use ($project, $saleData, $items, $payments) {
            $subtotal = $saleData['subtotal'] ?? 0;
            $discount = (float) ($saleData['discount'] ?? 0);
            $includeTva = (bool) ($saleData['include_tva'] ?? false);
            $tvaRate = (float) ($saleData['tva_rate'] ?? 20);

            $tax = 0;
            if ($includeTva && $tvaRate > 0) {
                $tax = round(($subtotal - $discount) * ($tvaRate / 100), 2);
            }
            $total = $subtotal - $discount + $tax;

            $sale = Sale::create([
                'project_id' => $project->id,
                'sale_number' => $saleData['sale_number'] ?? $this->generateSaleNumber($project),
                'status' => $saleData['status'] ?? 'completed',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'user_id' => auth()->id(),
                'source' => $saleData['source'] ?? 'manual',
                'include_tva' => $includeTva,
                'tva_rate' => $tvaRate,
            ]);

            if (!empty($items)) {
                foreach ($items as $item) {
                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total' => $item['quantity'] * $item['unit_price'],
                    ]);
                }
                $this->stockService->recordSaleOutflow($project, $sale->id, $items);
            }

            foreach ($payments as $paymentData) {
                $this->paymentService->createForSale($sale, $paymentData);
            }

            $this->activityLogService->log(
                $project,
                'created',
                $sale,
                null,
                $sale->toArray(),
                'sales',
                "Sale #{$sale->sale_number} created"
            );

            return $sale->load(['saleItems.product', 'payments']);
        });
    }

    /**
     * Add a payment to an existing sale.
     */
    public function addPayment(Sale $sale, array $paymentData): void
    {

        $remaining = max(0, (float) $sale->total - (float) $sale->total_paid);
        $amount = (float) ($paymentData['amount'] ?? 0);

        if ($amount <= 0) {
            throw new InvalidArgumentException('Payment amount must be greater than zero.');
        }
        if ($amount > $remaining) {
            throw new InvalidArgumentException("Amount exceeds remaining due ({$remaining}).");
        }

        $this->paymentService->createForSale($sale, $paymentData);
    }

    public function update(Sale $sale, array $data): Sale
    {
        $sale->update([
            'discount' => $data['discount'] ?? $sale->discount,
            'tax' => $data['tax'] ?? $sale->tax,
            'status' => $data['status'] ?? $sale->status,
        ]);

        $sale->update([
            'subtotal' => $sale->saleItems->sum('total'),
            'total' => $sale->subtotal - $sale->discount + $sale->tax,
        ]);

        $this->activityLogService->log(
            $sale->project,
            'updated',
            $sale,
            null,
            $sale->fresh()->toArray(),
            'sales',
            "Sale #{$sale->sale_number} updated"
        );

        return $sale->fresh(['saleItems.product', 'payments']);
    }

    protected function generateSaleNumber(Project $project): string
    {
        $count = Sale::forProject($project)->withTrashed()->count() + 1;

        return 'SALE-' . str_pad((string) $count, 6, '0', STR_PAD_LEFT);
    }
}
