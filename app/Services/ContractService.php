<?php

namespace App\Services;

use App\Enums\ContractStatus;
use App\Enums\ContractType;
use App\Models\Contract;
use App\Models\Worker;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ContractService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function create(Worker $worker, array $data): Contract
    {
        if ($data['type'] === ContractType::CDD->value && empty($data['end_date'])) {
            throw new InvalidArgumentException('CDD contracts require an end date.');
        }

        $activeContract = $worker->contracts()->where('status', ContractStatus::Active)->first();
        if ($activeContract && ($data['status'] ?? ContractStatus::Draft->value) === ContractStatus::Active->value) {
            throw new InvalidArgumentException('Worker already has an active contract. Terminate it first.');
        }

        return DB::transaction(function () use ($worker, $data) {
            $contract = Contract::create([
                'project_id' => $worker->project_id,
                'worker_id' => $worker->id,
                'type' => $data['type'],
                'status' => $data['status'] ?? ContractStatus::Draft->value,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'salary_amount' => $data['salary_amount'],
                'salary_currency' => $data['salary_currency'] ?? 'MAD',
                'notes' => $data['notes'] ?? null,
            ]);

            $this->activityLogService->log(
                $worker->project,
                'created',
                $contract,
                null,
                $contract->toArray(),
                'hr',
                "Contract #{$contract->id} created for {$worker->full_name}"
            );

            return $contract;
        });
    }

    public function update(Contract $contract, array $data): Contract
    {
        $oldValues = $contract->toArray();

        if (($data['type'] ?? $contract->type->value) === ContractType::CDD->value && empty($data['end_date']) && empty($contract->end_date)) {
            throw new InvalidArgumentException('CDD contracts require an end date.');
        }

        return DB::transaction(function () use ($contract, $data, $oldValues) {
            $contract->update([
                'type' => $data['type'] ?? $contract->type->value,
                'status' => $data['status'] ?? $contract->status->value,
                'start_date' => $data['start_date'] ?? $contract->start_date?->format('Y-m-d'),
                'end_date' => array_key_exists('end_date', $data) ? $data['end_date'] : $contract->end_date?->format('Y-m-d'),
                'salary_amount' => $data['salary_amount'] ?? $contract->salary_amount,
                'salary_currency' => $data['salary_currency'] ?? $contract->salary_currency,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $contract->notes,
            ]);

            $this->activityLogService->log(
                $contract->project,
                'updated',
                $contract,
                $oldValues,
                $contract->fresh()->toArray(),
                'hr',
                "Contract #{$contract->id} updated"
            );

            return $contract->fresh();
        });
    }

    public function terminate(Contract $contract): Contract
    {
        return $this->update($contract, ['status' => ContractStatus::Terminated->value]);
    }
}
