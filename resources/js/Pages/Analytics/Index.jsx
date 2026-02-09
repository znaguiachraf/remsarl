import ProjectLayout from '@/Layouts/ProjectLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

function formatValue(value) {
    return Number(value).toLocaleString();
}

export default function AnalyticsIndex({
    project,
    salesVsExpenses,
    topProducts,
    salesByHour,
    salesByDay,
    filters = {},
}) {
    const primaryColor = project?.primary_color || '#3B82F6';
    const secondaryColor = project?.secondary_color || '#10B981';

    const salesVsExpensesChartData = salesVsExpenses?.labels?.map((label, i) => ({
        label,
        sales: salesVsExpenses.datasets?.[0]?.data?.[i] ?? 0,
        expenses: salesVsExpenses.datasets?.[1]?.data?.[i] ?? 0,
    })) ?? [];

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.analytics.index', project.id), { ...filters, ...newFilters }, {
            preserveState: true,
        });
    };

    const peakHour = salesByHour?.reduce((best, cur) =>
        (cur.revenue > (best?.revenue ?? 0) ? cur : best), null);
    const peakDay = salesByDay?.reduce((best, cur) =>
        (cur.revenue > (best?.revenue ?? 0) ? cur : best), null);

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Analytics</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Sales vs expenses, top products, and peak times</p>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Analytics`} />

            <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                    <label className="text-sm font-medium text-gray-700">Period:</label>
                    <select
                        value={filters.period ?? 'month'}
                        onChange={(e) => applyFilters({ period: e.target.value })}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="month">By Month</option>
                        <option value="day">By Day</option>
                    </select>
                    <label className="ml-4 text-sm font-medium text-gray-700">Months:</label>
                    <select
                        value={filters.months ?? 12}
                        onChange={(e) => applyFilters({ months: parseInt(e.target.value, 10) })}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {[3, 6, 12, 24].map((n) => (
                            <option key={n} value={n}>{n} months</option>
                        ))}
                    </select>
                </div>

                {/* Sales vs Expenses */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Sales vs Expenses</h3>
                    <div className="h-72">
                        {salesVsExpensesChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesVsExpensesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#6b7280"
                                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatValue(value)}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="sales" name="Sales" fill={primaryColor} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill={secondaryColor} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                No sales or expenses data for the selected period.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products & Sales Time - 2 columns */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top Products */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Top 5 Products by Revenue</h3>
                        {topProducts?.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={topProducts}
                                        layout="vertical"
                                        margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tickFormatter={(v) => formatValue(v)} />
                                        <YAxis type="category" dataKey="product_name" width={75} tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(value) => formatValue(value)} />
                                        <Bar dataKey="total_revenue" name="Revenue" fill={primaryColor} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No product sales data yet.</p>
                        )}
                    </div>

                    {/* Sales by Hour */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Sales by Hour</h3>
                        {salesByHour?.some((r) => r.count > 0) ? (
                            <>
                                {peakHour && peakHour.revenue > 0 && (
                                    <p className="mb-3 text-sm text-gray-600">
                                        Peak hour: <strong>{peakHour.label}</strong> ({formatValue(peakHour.revenue)} revenue)
                                    </p>
                                )}
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesByHour} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                                            <Tooltip formatter={(value) => formatValue(value)} />
                                            <Bar dataKey="revenue" name="Revenue" fill={primaryColor} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500">No sales time data yet.</p>
                        )}
                    </div>
                </div>

                {/* Sales by Day of Week */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Sales by Day of Week</h3>
                    {salesByDay?.some((r) => r.count > 0) ? (
                        <>
                            {peakDay && peakDay.revenue > 0 && (
                                <p className="mb-3 text-sm text-gray-600">
                                    Peak day: <strong>{peakDay.label}</strong> ({formatValue(peakDay.revenue)} revenue, {peakDay.count} sales)
                                </p>
                            )}
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                                        <Tooltip formatter={(value) => formatValue(value)} />
                                        <Bar dataKey="revenue" name="Revenue" fill={secondaryColor} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="count" name="Count" fill={primaryColor} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">No sales by day data yet.</p>
                    )}
                </div>
            </div>
        </ProjectLayout>
    );
}
