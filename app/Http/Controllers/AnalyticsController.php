<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Display analytics dashboard (read-only).
     */
    public function index(Request $request, Project $project): Response
    {
        $period = $request->get('period', 'month');
        $groupBy = $request->get('time_group', 'hour');
        $months = min(24, max(1, (int) $request->get('months', 12)));
        $fromDate = $request->get('from_date');
        $toDate = $request->get('to_date');

        $salesVsExpenses = $this->analyticsService->salesVsExpenses($project, $period, $months);
        $expensesByCategory = $this->analyticsService->expensesByCategory($project, $fromDate, $toDate);
        $topProducts = $this->analyticsService->topProducts($project, 50, 'revenue', $fromDate, $toDate);
        $salesByHour = $this->analyticsService->salesTimeAnalysis($project, 'hour');
        $salesByDay = $this->analyticsService->salesTimeAnalysis($project, 'day');

        return Inertia::render('Analytics/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'primary_color' => $project->primary_color ?? '#3B82F6',
                'secondary_color' => $project->secondary_color ?? '#10B981',
            ],
            'salesVsExpenses' => $salesVsExpenses,
            'expensesByCategory' => $expensesByCategory,
            'topProducts' => $topProducts,
            'salesByHour' => $salesByHour,
            'salesByDay' => $salesByDay,
            'filters' => [
                'period' => $period,
                'time_group' => $groupBy,
                'months' => $months,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ]);
    }
}
