<?php

namespace App\Services;

use App\Enums\ExpenseStatus;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Project;
use App\Models\Sale;
use Illuminate\Support\Carbon;

class ProjectDashboardService
{
    /**
     * Get dashboard data for a project: KPIs, alerts, quick actions.
     * All data is project-scoped.
     */
    public function getData(Project $project, ?\App\Models\User $user = null): array
    {
        return [
            'kpis' => $this->getKpis($project),
            'alerts' => $this->getAlerts($project),
            'quickActions' => $this->getQuickActions($project),
            'chartData' => $this->getChartData($project),
            'employeeNotes' => $this->getEmployeeNotes($project, $user),
        ];
    }

    /**
     * Recent employee notes for dashboard (to/from employees).
     * Users see notes they authored OR notes about them (when they are a worker in the project).
     */
    protected function getEmployeeNotes(Project $project, ?\App\Models\User $user = null): array
    {
        $query = \App\Models\EmployeeNote::forProject($project);

        if ($user) {
            $workerIds = \App\Models\Worker::forProject($project)->where('user_id', $user->id)->pluck('id');
            $query->where(function ($q) use ($user, $workerIds) {
                $q->where('author_id', $user->id)
                    ->orWhereIn('worker_id', $workerIds);
            });
        }

        return $query
            ->with(['worker', 'author'])
            ->latest()
            ->limit(5)
            ->get()
            ->filter(fn ($n) => $n->worker && $n->author)
            ->map(fn ($n) => [
                'id' => $n->id,
                'content' => \Illuminate\Support\Str::limit($n->content, 80),
                'direction' => $n->direction,
                'created_at' => $n->created_at->toISOString(),
                'worker_name' => $n->worker->full_name,
                'author_name' => $n->author->name,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Monthly sales and expenses for the last 6 months (for chart).
     */
    protected function getChartData(Project $project): array
    {
        $result = [];
        $now = Carbon::now();

        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $ym = $date->format('Y-m');
            $result[$ym] = [
                'label' => $date->translatedFormat('M Y'),
                'year_month' => $ym,
                'sales' => 0,
                'expenses' => 0,
            ];
        }

        if ($project->hasModule('sales')) {
            $salesByMonth = Sale::forProject($project)
                ->whereRaw("`status` NOT IN ('cancelled', 'refunded')")
                ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, SUM(total) as total")
                ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
                ->pluck('total', 'ym');

            if ($project->hasModule('pos')) {
                $posByMonth = \App\Models\PosOrder::forProject($project)
                    ->where('status', 'completed')
                    ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, SUM(total) as total")
                    ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
                    ->pluck('total', 'ym');

                foreach ($posByMonth as $ym => $total) {
                    $current = $salesByMonth->get($ym, 0);
                    $salesByMonth->put($ym, (float) $current + (float) $total);
                }
            }

            foreach ($salesByMonth as $ym => $total) {
                if (isset($result[$ym])) {
                    $result[$ym]['sales'] = (float) $total;
                }
            }
        }

        if ($project->hasModule('expenses')) {
            $expensesByMonth = Expense::forProject($project)
                ->selectRaw("DATE_FORMAT(expense_date, '%Y-%m') as ym, SUM(amount) as total")
                ->groupByRaw("DATE_FORMAT(expense_date, '%Y-%m')")
                ->pluck('total', 'ym');

            foreach ($expensesByMonth as $ym => $total) {
                if (isset($result[$ym])) {
                    $result[$ym]['expenses'] = (float) $total;
                }
            }
        }

        return array_values($result);
    }

    /**
     * KPIs based on enabled modules.
     */
    protected function getKpis(Project $project): array
    {
        $kpis = [];

        if ($project->hasModule('sales')) {
            $thisMonth = Carbon::now()->startOfMonth();
            $salesThisMonth = Sale::forProject($project)
                ->where('created_at', '>=', $thisMonth)
                ->whereRaw("`status` NOT IN ('cancelled', 'refunded')");

            $kpis[] = [
                'key' => 'sales_this_month',
                'label' => 'Sales this month',
                'value' => (float) $salesThisMonth->sum('total'),
                'format' => 'currency',
                'subtext' => $salesThisMonth->count() . ' sales',
                'href' => route('projects.modules.sales.index', $project),
            ];
        }

        if ($project->hasModule('pos')) {
            $thisMonth = Carbon::now()->startOfMonth();
            $posRevenue = \App\Models\PosOrder::forProject($project)
                ->where('created_at', '>=', $thisMonth)
                ->where('status', 'completed');

            $kpis[] = [
                'key' => 'pos_this_month',
                'label' => 'POS revenue',
                'value' => (float) $posRevenue->sum('total'),
                'format' => 'currency',
                'subtext' => $posRevenue->count() . ' orders',
                'href' => route('projects.modules.pos.index', $project),
            ];
        }

        if ($project->hasModule('products')) {
            $productCount = Product::forProject($project)->count();
            $kpis[] = [
                'key' => 'products',
                'label' => 'Products',
                'value' => $productCount,
                'format' => 'number',
                'subtext' => null,
                'href' => route('projects.modules.products.index', $project),
            ];
        }

        if ($project->hasModule('stock')) {
            $lowStockCount = $this->getLowStockCount($project);
            $kpis[] = [
                'key' => 'low_stock',
                'label' => 'Low stock items',
                'value' => $lowStockCount,
                'format' => 'number',
                'subtext' => $lowStockCount > 0 ? 'Needs attention' : null,
                'href' => route('projects.modules.stock.index', $project),
            ];
        }

        if ($project->hasModule('sales')) {
            $unpaidCount = Sale::forProject($project)
                ->whereRaw("`status` NOT IN ('cancelled', 'refunded')")
                ->get()
                ->filter(fn ($s) => $s->payment_status === 'unpaid' || $s->payment_status === 'partial')
                ->count();

            $kpis[] = [
                'key' => 'unpaid_sales',
                'label' => 'Unpaid sales',
                'value' => $unpaidCount,
                'format' => 'number',
                'subtext' => $unpaidCount > 0 ? 'Collect payment' : null,
                'href' => route('projects.modules.sales.index', $project),
            ];
        }

        if ($project->hasModule('expenses')) {
            $pendingExpenses = Expense::forProject($project)
                ->where('status', ExpenseStatus::Pending)
                ->count();

            $kpis[] = [
                'key' => 'pending_expenses',
                'label' => 'Pending expenses',
                'value' => $pendingExpenses,
                'format' => 'number',
                'subtext' => $pendingExpenses > 0 ? 'To pay' : null,
                'href' => route('projects.modules.expenses.index', $project),
            ];

            $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
            $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();
            $expensesThisMonth = (float) Expense::forProject($project)
                ->whereBetween('expense_date', [$thisMonthStart, $thisMonthEnd])
                ->sum('amount');

            $kpis[] = [
                'key' => 'expenses_this_month',
                'label' => 'Expenses this month',
                'value' => $expensesThisMonth,
                'format' => 'currency',
                'subtext' => null,
                'href' => route('projects.modules.expenses.index', $project),
            ];
        }

        if (($project->hasModule('sales') || $project->hasModule('pos')) && $project->hasModule('expenses')) {
            $summary = app(AnalyticsService::class)->netIncomeSummary(
                $project,
                Carbon::now()->startOfMonth()->toDateString(),
                Carbon::now()->endOfMonth()->toDateString()
            );
            $kpis[] = [
                'key' => 'net_income_this_month',
                'label' => 'Net income (this month)',
                'value' => $summary['net_income'],
                'format' => 'currency',
                'subtext' => 'Revenue − expenses',
                'href' => route('projects.modules.analytics.index', $project),
            ];
        }

        if ($project->hasModule('hr')) {
            $workerCount = \App\Models\Worker::forProject($project)->count();
            $kpis[] = [
                'key' => 'workers',
                'label' => 'Workers',
                'value' => $workerCount,
                'format' => 'number',
                'subtext' => null,
                'href' => route('projects.modules.hr.workers.index', $project),
            ];
        }

        return $kpis;
    }

    /**
     * Alerts requiring attention.
     */
    protected function getAlerts(Project $project): array
    {
        $alerts = [];

        if ($project->hasModule('stock')) {
            $lowStock = $this->getLowStockProducts($project);
            foreach ($lowStock as $p) {
                $alerts[] = [
                    'key' => 'low_stock_' . $p['id'],
                    'severity' => 'warning',
                    'message' => sprintf('%s is low on stock (%d left)', $p['name'], $p['stock']),
                    'href' => route('projects.modules.stock.index', $project),
                ];
            }

            if (count($lowStock) > 3) {
                $alerts = array_slice($alerts, 0, 3);
                $alerts[] = [
                    'key' => 'low_stock_more',
                    'severity' => 'warning',
                    'message' => count($lowStock) . ' more items low on stock',
                    'href' => route('projects.modules.stock.index', $project),
                ];
            }
        }

        if ($project->hasModule('sales')) {
            $unpaidCount = Sale::forProject($project)
                ->whereRaw("`status` NOT IN ('cancelled', 'refunded')")
                ->get()
                ->filter(fn ($s) => $s->payment_status === 'unpaid' || $s->payment_status === 'partial')
                ->count();

            if ($unpaidCount > 0) {
                $alerts[] = [
                    'key' => 'unpaid_sales',
                    'severity' => 'info',
                    'message' => $unpaidCount . ' sale(s) have unpaid or partial payments',
                    'href' => route('projects.modules.sales.index', $project),
                ];
            }
        }

        if ($project->hasModule('expenses')) {
            $pendingAmount = Expense::forProject($project)
                ->where('status', ExpenseStatus::Pending)
                ->sum('amount');

            if ($pendingAmount > 0) {
                $alerts[] = [
                    'key' => 'pending_expenses',
                    'severity' => 'info',
                    'message' => 'Pending expenses: ' . number_format($pendingAmount, 0) . ' to pay',
                    'href' => route('projects.modules.expenses.index', $project),
                ];
            }
        }

        return $alerts;
    }

    /**
     * Quick actions based on enabled modules (contextual actions, not navigation).
     */
    protected function getQuickActions(Project $project): array
    {
        $actions = [];

        if ($project->hasModule('sales')) {
            $actions[] = [
                'key' => 'new_sale',
                'label' => 'New sale',
                'href' => route('projects.modules.sales.create', $project),
                'icon' => 'plus',
            ];
        }

        if ($project->hasModule('pos')) {
            $actions[] = [
                'key' => 'open_pos',
                'label' => 'Open POS',
                'href' => route('projects.modules.pos.index', $project),
                'icon' => 'shopping-cart',
            ];
        }

        if ($project->hasModule('expenses')) {
            $actions[] = [
                'key' => 'record_expense',
                'label' => 'Record expense',
                'href' => route('projects.modules.expenses.index', $project),
                'icon' => 'dollar-sign',
            ];
        }

        if ($project->hasModule('products')) {
            $actions[] = [
                'key' => 'add_product',
                'label' => 'Add product',
                'href' => route('projects.modules.products.index', $project),
                'icon' => 'package',
            ];
        }

        if ($project->hasModule('stock')) {
            $actions[] = [
                'key' => 'stock_adjustment',
                'label' => 'Adjust stock',
                'href' => route('projects.modules.stock.index', $project),
                'icon' => 'archive',
            ];
        }

        if ($project->hasModule('hr')) {
            $actions[] = [
                'key' => 'add_worker',
                'label' => 'Add worker',
                'href' => route('projects.modules.hr.workers.index', $project),
                'icon' => 'users',
            ];
        }

        $actions[] = [
            'key' => 'employee_notes',
            'label' => 'Employee notes',
            'href' => route('projects.notes.index', $project),
            'icon' => 'file-text',
        ];

        return $actions;
    }

    protected function getLowStockCount(Project $project): int
    {
        return Product::forProject($project)
            ->where('is_active', true)
            ->whereNotNull('minimum_stock')
            ->where('minimum_stock', '>', 0)
            ->get()
            ->filter(fn ($p) => $p->stock_quantity <= $p->minimum_stock)
            ->count();
    }

    /**
     * @return array<int, array{id: int, name: string, stock: int}>
     */
    protected function getLowStockProducts(Project $project, int $limit = 5): array
    {
        return Product::forProject($project)
            ->where('is_active', true)
            ->whereNotNull('minimum_stock')
            ->where('minimum_stock', '>', 0)
            ->get()
            ->filter(fn ($p) => $p->stock_quantity <= $p->minimum_stock)
            ->take($limit)
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'stock' => $p->stock_quantity,
            ])
            ->values()
            ->toArray();
    }
}
