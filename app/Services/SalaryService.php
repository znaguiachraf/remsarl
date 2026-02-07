<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\SalaryStatus;
use App\Models\Salary;
use App\Models\Worker;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SalaryService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function generate(Worker $worker, int $month, int $year): Salary
    {
        $contract = $worker->activeContract;
        if (!$contract) {
            throw new InvalidArgumentException('Worker has no active contract.');
        }

        $exists = Salary::where('project_id', $worker->project_id)
            ->where('worker_id', $worker->id)
            ->where('month', $month)
            ->where('year', $year)
            ->exists();

        if ($exists) {
            throw new InvalidArgumentException("Salary for {$month}/{$year} already exists for this worker.");
        }

        $grossAmount = (float) $contract->salary_amount;
        $netAmount = $grossAmount; // TODO: apply deductions (CNSS, etc.) if needed

        return DB::transaction(function () use ($worker, $contract, $month, $year, $grossAmount, $netAmount) {
            $salary = Salary::create([
                'project_id' => $worker->project_id,
                'worker_id' => $worker->id,
                'contract_id' => $contract->id,
                'month' => $month,
                'year' => $year,
                'gross_amount' => $grossAmount,
                'net_amount' => $netAmount,
                'status' => SalaryStatus::Generated,
            ]);

            $this->activityLogService->log(
                $worker->project,
                'created',
                $salary,
                null,
                $salary->toArray(),
                'hr',
                "Salary {$month}/{$year} generated for {$worker->full_name}"
            );

            return $salary;
        });
    }

    public function recordPayment(Salary $salary, array $paymentData): \App\Models\Payment
    {
        if ($salary->status === SalaryStatus::Paid) {
            throw new InvalidArgumentException('Salary is already paid.');
        }

        $payment = DB::transaction(function () use ($salary, $paymentData) {
            $payment = $salary->payments()->create([
                'project_id' => $salary->project_id,
                'payment_method' => $paymentData['payment_method'] ?? 'transfer',
                'amount' => $paymentData['amount'] ?? $salary->net_amount,
                'reference' => $paymentData['reference'] ?? null,
                'payment_date' => $paymentData['payment_date'] ?? now()->format('Y-m-d'),
                'user_id' => auth()->id(),
                'notes' => $paymentData['notes'] ?? null,
                'status' => PaymentStatus::Paid,
            ]);

            $totalPaid = (float) $salary->payments()->whereNotIn('status', ['failed', 'refunded'])->sum('amount');
            if ($totalPaid >= (float) $salary->net_amount) {
                $salary->update(['status' => SalaryStatus::Paid]);
            }

            $this->activityLogService->log(
                $salary->project,
                'created',
                $payment,
                null,
                $payment->toArray(),
                'hr',
                "Payment #{$payment->id} recorded for Salary #{$salary->id}"
            );

            return $payment;
        });

        return $payment;
    }
}
