<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Sale;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PaymentService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function list(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Payment::forProject($project)
            ->with(['user', 'sale'])
            ->orderByDesc('payment_date')
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereDate('payment_date', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('payment_date', '<=', $filters['to_date']);
        }

        return $query->paginate($filters['per_page'] ?? 20)->withQueryString();
    }

    /**
     * Create payment(s) for a sale. Called automatically when a sale is created.
     * Every sale has one or more payments.
     */
    public function createForSale(Sale $sale, array $paymentData): Payment
    {
        if ($sale->project_id === null) {
            throw new InvalidArgumentException('Sale must belong to a project.');
        }

        $amount = (float) ($paymentData['amount'] ?? $sale->total);
        if ($amount <= 0) {
            throw new InvalidArgumentException('Payment amount must be greater than zero.');
        }

        return DB::transaction(function () use ($sale, $paymentData, $amount) {
            $payment = Payment::create([
                'project_id' => $sale->project_id,
                'sale_id' => $sale->id,
                'payment_method' => $paymentData['payment_method'] ?? 'cash',
                'amount' => $amount,
                'reference' => $paymentData['reference'] ?? null,
                'payment_date' => $paymentData['payment_date'] ?? now()->format('Y-m-d'),
                'user_id' => auth()->id(),
                'notes' => $paymentData['notes'] ?? null,
                'status' => PaymentStatus::Paid,
            ]);

            $this->activityLogService->log(
                $sale->project,
                'created',
                $payment,
                null,
                $payment->toArray(),
                'payments',
                "Payment #{$payment->id} created for Sale #{$sale->id}"
            );

            return $payment->load(['user', 'sale']);
        });
    }

    public function refund(Payment $payment): Payment
    {
        if ($payment->status === PaymentStatus::Refunded) {
            throw new InvalidArgumentException('Payment is already refunded.');
        }

        return DB::transaction(function () use ($payment) {
            $oldStatus = $payment->status->value;
            $payment->update(['status' => PaymentStatus::Refunded]);

            $this->activityLogService->log(
                $payment->project,
                'refunded',
                $payment,
                ['status' => $oldStatus],
                ['status' => 'refunded'],
                'payments',
                "Payment #{$payment->id} refunded"
            );

            return $payment->fresh(['user', 'sale']);
        });
    }

    public function reinstate(Payment $payment): Payment
    {
        if ($payment->status !== PaymentStatus::Refunded) {
            throw new InvalidArgumentException('Only refunded payments can be reinstated.');
        }

        return DB::transaction(function () use ($payment) {
            $payment->update(['status' => PaymentStatus::Paid]);

            $this->activityLogService->log(
                $payment->project,
                'reinstate',
                $payment,
                ['status' => 'refunded'],
                ['status' => 'paid'],
                'payments',
                "Payment #{$payment->id} reinstated"
            );

            return $payment->fresh(['user', 'sale']);
        });
    }

    public function update(Payment $payment, array $data): Payment
    {
        if ($payment->status === PaymentStatus::Refunded) {
            throw new InvalidArgumentException('Cannot edit a refunded payment.');
        }

        $sale = $payment->sale;
        $oldValues = $payment->toArray();

        if (isset($data['amount']) && $sale) {
            $newAmount = (float) $data['amount'];
            $otherPaid = (float) $sale->payments()
                ->where('id', '!=', $payment->id)
                ->whereNotIn('status', ['failed', 'refunded'])
                ->sum('amount');
            $remaining = max(0, (float) $sale->total_due - $otherPaid);
            if ($newAmount > $remaining) {
                throw new InvalidArgumentException("Amount exceeds remaining due ({$remaining}). Overpayment not allowed.");
            }
        }

        return DB::transaction(function () use ($payment, $data, $oldValues) {
            $update = [
                'payment_method' => $data['payment_method'] ?? $payment->payment_method,
                'amount' => array_key_exists('amount', $data) ? $data['amount'] : $payment->amount,
                'reference' => array_key_exists('reference', $data) ? $data['reference'] : $payment->reference,
                'payment_date' => array_key_exists('payment_date', $data) ? $data['payment_date'] : $payment->payment_date?->format('Y-m-d'),
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $payment->notes,
                'status' => $data['status'] ?? $payment->status->value,
            ];
            $payment->update($update);

            $this->activityLogService->log(
                $payment->project,
                'updated',
                $payment,
                $oldValues,
                $payment->fresh()->toArray(),
                'payments',
                "Payment #{$payment->id} updated"
            );

            return $payment->fresh(['user', 'sale']);
        });
    }

    public function delete(Payment $payment): void
    {
        $project = $payment->project;
        $snapshot = $payment->toArray();

        DB::transaction(function () use ($payment, $project, $snapshot) {
            $this->activityLogService->log(
                $project,
                'deleted',
                $payment,
                $snapshot,
                null,
                'payments',
                "Payment #{$payment->id} deleted"
            );

            $payment->delete();
        });
    }
}
