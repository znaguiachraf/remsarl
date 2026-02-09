<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Project;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    protected function isSqlite(): bool
    {
        return DB::connection()->getDriverName() === 'sqlite';
    }

    /**
     * Sales vs Expenses chart data.
     * Aggregates totals per period (day or month). Returns labels + datasets.
     */
    public function salesVsExpenses(Project $project, ?string $period = 'month', ?int $months = 12): array
    {
        $end = now();
        $start = $end->copy()->subMonths($months);

        if ($period === 'day') {
            $dateExpr = $this->isSqlite() ? 'date(created_at)' : 'DATE(created_at)';
            $sales = Sale::forProject($project)
                ->whereBetween('created_at', [$start, $end])
                ->whereNotIn('status', ['cancelled', 'refunded'])
                ->selectRaw("{$dateExpr} as date, SUM(total) as total")
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('total', 'date')
                ->map(fn ($v) => (float) $v);

            $expenses = Expense::forProject($project)
                ->whereBetween('expense_date', [$start->toDateString(), $end->toDateString()])
                ->selectRaw('expense_date as date, SUM(amount) as total')
                ->groupBy('expense_date')
                ->orderBy('expense_date')
                ->pluck('total', 'date')
                ->map(fn ($v) => (float) $v);

            $dates = collect($sales->keys())->merge($expenses->keys())->unique()->sort()->values();
            $labels = $dates->map(fn ($d) => Carbon::parse($d)->format('M d'))->toArray();

            $salesData = $dates->map(fn ($d) => $sales[$d] ?? 0)->toArray();
            $expensesData = $dates->map(fn ($d) => $expenses[$d] ?? 0)->toArray();
        } else {
            $monthExpr = $this->isSqlite()
                ? "strftime('%Y-%m', created_at)"
                : "DATE_FORMAT(created_at, '%Y-%m')";
            $sales = Sale::forProject($project)
                ->whereBetween('created_at', [$start, $end])
                ->whereNotIn('status', ['cancelled', 'refunded'])
                ->selectRaw("{$monthExpr} as month, SUM(total) as total")
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month')
                ->map(fn ($v) => (float) $v);

            $monthExprExp = $this->isSqlite()
                ? "strftime('%Y-%m', expense_date)"
                : "DATE_FORMAT(expense_date, '%Y-%m')";
            $expenses = Expense::forProject($project)
                ->whereBetween('expense_date', [$start->toDateString(), $end->toDateString()])
                ->selectRaw("{$monthExprExp} as month, SUM(amount) as total")
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month')
                ->map(fn ($v) => (float) $v);

            $monthsKeys = collect($sales->keys())->merge($expenses->keys())->unique()->sort()->values();
            $labels = $monthsKeys->map(fn ($m) => Carbon::parse($m . '-01')->format('M Y'))->toArray();

            $salesData = $monthsKeys->map(fn ($m) => $sales[$m] ?? 0)->toArray();
            $expensesData = $monthsKeys->map(fn ($m) => $expenses[$m] ?? 0)->toArray();
        }

        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Sales', 'data' => $salesData],
                ['label' => 'Expenses', 'data' => $expensesData],
            ],
        ];
    }

    /**
     * Top products by quantity sold or revenue.
     */
    public function topProducts(Project $project, int $limit = 5, string $by = 'revenue'): array
    {
        $saleIds = Sale::forProject($project)
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->pluck('id');

        $orderBy = $by === 'quantity' ? 'total_quantity' : 'total_revenue';

        $items = SaleItem::whereIn('sale_id', $saleIds)
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('products.project_id', $project->id)
            ->selectRaw('
                sale_items.product_id,
                products.name as product_name,
                SUM(sale_items.quantity) as total_quantity,
                SUM(sale_items.total) as total_revenue
            ')
            ->groupBy('sale_items.product_id', 'products.name')
            ->orderByDesc($orderBy)
            ->limit($limit)
            ->get();

        return $items->map(fn ($row) => [
            'product_id' => $row->product_id,
            'product_name' => $row->product_name,
            'total_quantity' => (int) $row->total_quantity,
            'total_revenue' => (float) $row->total_revenue,
        ])->toArray();
    }

    /**
     * Sales by hour (0-23) or by day of week.
     * Returns time label, count of sales, total revenue.
     */
    public function salesTimeAnalysis(Project $project, string $groupBy = 'hour'): array
    {
        $query = Sale::forProject($project)
            ->whereNotIn('status', ['cancelled', 'refunded']);

        if ($groupBy === 'day') {
            $grpExpr = $this->isSqlite()
                ? "cast(strftime('%w', created_at) as integer)"
                : 'DAYOFWEEK(created_at)';
            $labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            $data = $query->selectRaw("{$grpExpr} as grp, COUNT(*) as count, SUM(total) as revenue")
                ->groupBy('grp')
                ->orderBy('grp')
                ->get()
                ->keyBy('grp');

            $range = $this->isSqlite() ? range(0, 6) : range(1, 7);
            $labelIdx = $this->isSqlite() ? fn ($d) => $labels[$d] : fn ($d) => $labels[$d - 1];

            return collect($range)->map(fn ($d) => [
                'label' => $labelIdx($d),
                'count' => (int) ($data[$d]->count ?? 0),
                'revenue' => (float) ($data[$d]->revenue ?? 0),
            ])->toArray();
        }

        $hourExpr = $this->isSqlite()
            ? "cast(strftime('%H', created_at) as integer)"
            : 'HOUR(created_at)';
        $data = $query->selectRaw("{$hourExpr} as grp, COUNT(*) as count, SUM(total) as revenue")
            ->groupBy('grp')
            ->orderBy('grp')
            ->get()
            ->keyBy('grp');

        return collect(range(0, 23))->map(fn ($h) => [
            'label' => sprintf('%02d:00', $h),
            'count' => (int) ($data[$h]->count ?? 0),
            'revenue' => (float) ($data[$h]->revenue ?? 0),
        ])->toArray();
    }
}
