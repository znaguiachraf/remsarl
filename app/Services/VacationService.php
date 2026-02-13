<?php

namespace App\Services;

use App\Enums\VacationStatus;
use App\Models\Project;
use App\Models\Vacation;
use App\Models\Worker;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class VacationService
{
    /**
     * Vacation days used by a worker in a given year (approved only).
     */
    public function getUsedDaysForWorker(Worker $worker, int $year): int
    {
        return (int) Vacation::where('worker_id', $worker->id)
            ->where('status', VacationStatus::Approved)
            ->whereYear('start_date', '<=', $year)
            ->whereYear('end_date', '>=', $year)
            ->get()
            ->sum(fn (Vacation $v) => $this->daysOverlapInYear($v, $year));
    }

    /**
     * Days of a vacation that fall within the given year.
     */
    protected function daysOverlapInYear(Vacation $vacation, int $year): int
    {
        $start = Carbon::create($year, 1, 1);
        $end = Carbon::create($year, 12, 31);
        $vStart = $vacation->start_date->copy();
        $vEnd = $vacation->end_date->copy();
        $overlapStart = $vStart->max($start);
        $overlapEnd = $vEnd->min($end);
        if ($overlapStart->gt($overlapEnd)) {
            return 0;
        }

        return $overlapStart->diffInDays($overlapEnd) + 1;
    }

    /**
     * Allocated (from worker), used, and remaining for a worker in a year.
     */
    public function getBalanceForWorker(Worker $worker, int $year): array
    {
        $allocated = (int) ($worker->vacation_days_per_year ?? 0);
        $used = $this->getUsedDaysForWorker($worker, $year);
        $remaining = max(0, $allocated - $used);

        return [
            'allocated' => $allocated,
            'used' => $used,
            'remaining' => $remaining,
            'year' => $year,
        ];
    }

    /**
     * List all vacations for project with filters. Paginated.
     */
    public function listForProject(Project $project, array $filters = []): LengthAwarePaginator
    {
        $query = Vacation::forProject($project)
            ->with('worker')
            ->orderByDesc('start_date');

        if (!empty($filters['worker_id'])) {
            $query->where('worker_id', $filters['worker_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['year'])) {
            $query->whereYear('start_date', '<=', $filters['year'])
                ->whereYear('end_date', '>=', $filters['year']);
        }

        return $query->paginate($filters['per_page'] ?? 20)->withQueryString();
    }

    /**
     * Approved vacations in a date range for calendar (all workers in project).
     */
    public function getCalendarEvents(Project $project, string $from, string $to): array
    {
        return Vacation::forProject($project)
            ->with('worker')
            ->where('status', VacationStatus::Approved)
            ->where('end_date', '>=', $from)
            ->where('start_date', '<=', $to)
            ->orderBy('start_date')
            ->get()
            ->map(fn (Vacation $v) => [
                'id' => $v->id,
                'title' => $v->worker->full_name ?? 'Worker',
                'worker_id' => $v->worker_id,
                'start' => $v->start_date->format('Y-m-d'),
                'end' => $v->end_date->format('Y-m-d'),
                'days_count' => $v->days_count,
            ])
            ->toArray();
    }

    /**
     * Summary of used vacation days per worker for a year (for managers).
     */
    public function getWorkersVacationSummary(Project $project, int $year): array
    {
        /** @var \Illuminate\Database\Eloquent\Collection<int, Worker> $workers */
        $workers = Worker::forProject($project)->orderBy('first_name')->get();
        $result = [];
        foreach ($workers as $worker) {
            $balance = $this->getBalanceForWorker($worker, $year);
            $result[] = [
                'worker_id' => $worker->id,
                'worker_name' => $worker->full_name,
                'allocated' => $balance['allocated'],
                'used' => $balance['used'],
                'remaining' => $balance['remaining'],
            ];
        }

        return $result;
    }
}
