<?php

namespace App\Services;

use App\Enums\ExpenseStatus;
use App\Enums\PaymentStatus;
use App\Models\Expense;
use App\Models\Order;
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
            ->with(['user', 'payable'])
            ->orderByDesc('payment_date')
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['payable_type'])) {
            $query->where('payable_type', $filters['payable_type']);
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

    public function create(Project $project, array $data): Payment
    {
        $payable = $this->resolvePayable($data['payable_type'], $data['payable_id']);
        if (!$payable || $payable->project_id !== $project->id) {
            throw new InvalidArgumentException('Invalid payable or payable does not belong to project.');
        }

        $amount = (float) $data['amount'];
        $totalDue = (float) $payable->total_due;
        $totalPaid = (float) $payable->total_paid;
        $remaining = max(0, $totalDue - $totalPaid);

        if ($amount <= 0) {
            throw new InvalidArgumentException('Payment amount must be greater than zero.');
        }
        if ($amount > $remaining) {
            throw new InvalidArgumentException("Payment amount exceeds remaining due ({$remaining}). Overpayment not allowed.");
        }

        return DB::transaction(function () use ($project, $data, $payable) {
            $payment = Payment::create([
                'project_id' => $project->id,
                'payable_type' => $data['payable_type'],
                'payable_id' => $data['payable_id'],
                'payment_method' => $data['payment_method'],
                'amount' => $data['amount'],
                'reference' => $data['reference'] ?? null,
                'payment_date' => $data['payment_date'],
                'user_id' => auth()->id(),
                'notes' => $data['notes'] ?? null,
                'status' => PaymentStatus::Paid,
            ]);

            $this->updatePayableStatusIfNeeded($payable);

            $this->activityLogService->log(
                $project,
                'created',
                $payment,
                null,
                $payment->toArray(),
                'payments',
                "Payment #{$payment->id} created for " . class_basename($payable) . " #{$payable->id}"
            );

            return $payment->load(['user', 'payable']);
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

            $payable = $payment->payable;
            if ($payable) {
                $this->updatePayableStatusIfNeeded($payable);
            }

            $this->activityLogService->log(
                $payment->project,
                'refunded',
                $payment,
                ['status' => $oldStatus],
                ['status' => 'refunded'],
                'payments',
                "Payment #{$payment->id} refunded"
            );

            return $payment->fresh(['user', 'payable']);
        });
    }

    public function reinstate(Payment $payment): Payment
    {
        if ($payment->status !== PaymentStatus::Refunded) {
            throw new InvalidArgumentException('Only refunded payments can be reinstated.');
        }

        return DB::transaction(function () use ($payment) {
            $payment->update(['status' => PaymentStatus::Paid]);

            $payable = $payment->payable;
            if ($payable) {
                $this->updatePayableStatusIfNeeded($payable);
            }

            $this->activityLogService->log(
                $payment->project,
                'reinstate',
                $payment,
                ['status' => 'refunded'],
                ['status' => 'paid'],
                'payments',
                "Payment #{$payment->id} reinstated"
            );

            return $payment->fresh(['user', 'payable']);
        });
    }

    public function update(Payment $payment, array $data): Payment
    {
        if ($payment->status === PaymentStatus::Refunded) {
            throw new InvalidArgumentException('Cannot edit a refunded payment.');
        }

        $payable = $payment->payable;
        $oldValues = $payment->toArray();

        if (isset($data['amount']) && $payable) {
            $newAmount = (float) $data['amount'];
            $otherPaid = (float) $payable->payments()
                ->where('id', '!=', $payment->id)
                ->whereNotIn('status', ['failed', 'refunded'])
                ->sum('amount');
            $remaining = max(0, (float) $payable->total_due - $otherPaid);
            if ($newAmount > $remaining) {
                throw new InvalidArgumentException("Amount exceeds remaining due ({$remaining}). Overpayment not allowed.");
            }
        }

        return DB::transaction(function () use ($payment, $data, $payable, $oldValues) {
            $update = [
                'payment_method' => $data['payment_method'] ?? $payment->payment_method,
                'amount' => array_key_exists('amount', $data) ? $data['amount'] : $payment->amount,
                'reference' => array_key_exists('reference', $data) ? $data['reference'] : $payment->reference,
                'payment_date' => array_key_exists('payment_date', $data) ? $data['payment_date'] : $payment->payment_date?->format('Y-m-d'),
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $payment->notes,
                'status' => $data['status'] ?? $payment->status->value,
            ];
            $payment->update($update);

            if ($payable) {
                $this->updatePayableStatusIfNeeded($payable);
            }

            $this->activityLogService->log(
                $payment->project,
                'updated',
                $payment,
                $oldValues,
                $payment->fresh()->toArray(),
                'payments',
                "Payment #{$payment->id} updated"
            );

            return $payment->fresh(['user', 'payable']);
        });
    }

    public function delete(Payment $payment): void
    {
        $project = $payment->project;
        $payable = $payment->payable;
        $snapshot = $payment->toArray();

        DB::transaction(function () use ($payment, $project, $payable, $snapshot) {
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

            if ($payable) {
                $this->updatePayableStatusIfNeeded($payable);
            }
        });
    }

    protected function resolvePayable(string $type, int $id)
    {
        return match ($type) {
            Expense::class => Expense::find($id),
            Sale::class => Sale::find($id),
            Order::class => Order::find($id),
            default => null,
        };
    }

    protected function updatePayableStatusIfNeeded($payable): void
    {
        if ($payable instanceof Expense) {
            $totalPaid = (float) $payable->payments()
                ->whereNotIn('status', ['failed', 'refunded'])
                ->sum('amount');
            $totalDue = (float) $payable->amount;
            $payable->update([
                'status' => $totalPaid >= $totalDue ? ExpenseStatus::Paid : ExpenseStatus::Pending,
            ]);
        }
    }
}
