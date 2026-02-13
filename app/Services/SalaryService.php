<?php

namespace App\Services;

use App\Enums\AttendanceStatus;
use App\Enums\ExpenseStatus;
use App\Enums\PaymentStatus;
use App\Enums\SalaryStatus;
use App\Models\Attendance;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Salary;
use App\Models\Worker;
use Carbon\Carbon;
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

        // Working days = weekdays (Mon–Fri) in the month
        $workingDays = $this->getWorkingDaysInMonth($month, $year);
        $dailyRate = $workingDays > 0 ? $grossAmount / $workingDays : $grossAmount;

        // Attendance-based deduction: absent = full day, half_day = 0.5 day
        $absentDaysEquivalent = $this->getAbsentDaysEquivalent($worker, $month, $year);
        $deduction = round($absentDaysEquivalent * $dailyRate, 2);
        $netAmount = max(0, round($grossAmount - $deduction, 2));

        return DB::transaction(function () use ($worker, $contract, $month, $year, $grossAmount, $netAmount, $absentDaysEquivalent, $deduction) {
            $salary = Salary::create([
                'project_id' => $worker->project_id,
                'worker_id' => $worker->id,
                'contract_id' => $contract->id,
                'month' => $month,
                'year' => $year,
                'gross_amount' => $grossAmount,
                'net_amount' => $netAmount,
                'absent_days' => round($absentDaysEquivalent, 1),
                'attendance_deduction' => $deduction,
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

            $this->createExpenseForSalary($worker->project, $salary, $worker->full_name, $month, $year);

            return $salary;
        });
    }

    /**
     * Create an expense record when a salary is generated (for expense tracking and net income).
     */
    protected function createExpenseForSalary(\App\Models\Project $project, Salary $salary, string $workerName, int $month, int $year): void
    {
        $categoryId = ExpenseCategory::forProject($project)
            ->where('name', 'Salaries')
            ->first()?->id;

        $expenseDate = Carbon::create($year, $month)->endOfMonth()->toDateString();

        Expense::create([
            'project_id' => $project->id,
            'expense_category_id' => $categoryId,
            'reference' => 'SALARY-' . $salary->id,
            'description' => "Salary: {$workerName} ({$month}/{$year})",
            'amount' => $salary->net_amount,
            'status' => ExpenseStatus::Pending,
            'expense_date' => $expenseDate,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * When salary is fully paid, mark the linked expense as Paid.
     */
    protected function markSalaryExpenseAsPaid(Salary $salary): void
    {
        Expense::forProject($salary->project)
            ->where('reference', 'SALARY-' . $salary->id)
            ->where('status', ExpenseStatus::Pending)
            ->update(['status' => ExpenseStatus::Paid]);
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
                $this->markSalaryExpenseAsPaid($salary);
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

    public function update(Salary $salary, array $data): Salary
    {
        if ($salary->status === SalaryStatus::Paid) {
            throw new InvalidArgumentException('Cannot edit a paid salary.');
        }

        $oldValues = $salary->toArray();
        $salary->update([
            'gross_amount' => $data['gross_amount'] ?? $salary->gross_amount,
            'net_amount' => $data['net_amount'] ?? $salary->net_amount,
            'absent_days' => $data['absent_days'] ?? $salary->absent_days,
            'attendance_deduction' => $data['attendance_deduction'] ?? $salary->attendance_deduction,
        ]);

        $this->activityLogService->log(
            $salary->project,
            'updated',
            $salary,
            $oldValues,
            $salary->fresh()->toArray(),
            'hr',
            "Salary {$salary->month}/{$salary->year} updated for {$salary->worker->full_name}"
        );

        return $salary->fresh();
    }

    public function delete(Salary $salary): void
    {
        if ($salary->status === SalaryStatus::Paid) {
            throw new InvalidArgumentException('Cannot delete a paid salary. Refund payments first.');
        }

        $project = $salary->project;
        $snapshot = $salary->toArray();
        $workerName = $salary->worker->full_name;

        DB::transaction(function () use ($salary, $project, $snapshot, $workerName) {
            $this->activityLogService->log(
                $project,
                'deleted',
                $salary,
                $snapshot,
                null,
                'hr',
                "Salary {$salary->month}/{$salary->year} deleted for {$workerName}"
            );
            $salary->payments()->delete();
            $salary->delete();
        });
    }

    public function getWorkingDaysInMonth(int $month, int $year): int
    {
        $start = Carbon::create($year, $month, 1);
        $end = Carbon::create($year, $month)->endOfMonth();
        $days = 0;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            if (!$d->isWeekend()) {
                $days++;
            }
        }
        return $days;
    }

    protected function getAbsentDaysEquivalent(Worker $worker, int $month, int $year): float
    {
        $attendances = Attendance::where('project_id', $worker->project_id)
            ->where('worker_id', $worker->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();

        $equivalent = 0.0;
        foreach ($attendances as $a) {
            $equivalent += match ($a->status) {
                AttendanceStatus::Absent => 1.0,
                AttendanceStatus::HalfDay => 0.5,
                default => 0.0,
            };
        }

        return $equivalent;
    }
}
