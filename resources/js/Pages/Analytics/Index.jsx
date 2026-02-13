import ProjectLayout from '@/Layouts/ProjectLayout';
import {
    IconDollar,
    IconFolder,
    IconShoppingBag,
    IconUsers,
    IconCreditCard,
} from '@/Components/expense/Icons';
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
    PieChart,
    Pie,
    Cell,
} from 'recharts';

function formatValue(value) {
    return Number(value).toLocaleString();
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function AnalyticsIndex({
    project,
    salesVsExpenses,
    expensesByCategory,
    topProducts,
    salesByHour,
    salesByDay,
    filters = {},
    netIncomeSummary,
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

                {/* Net income summary (payment calculations with expense deductions) */}
                {netIncomeSummary && (
                    <div
                        className="rounded-xl border p-4 shadow-sm"
                        style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}08` }}
                    >
                        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <IconCreditCard className="h-4 w-4" style={{ color: primaryColor }} />
                            Net income summary (filtered period)
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-6">
                            <div className="flex items-start gap-2">
                                <IconShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                <div>
                                    <span className="text-xs text-gray-500">Revenue</span>
                                    <p className="text-lg font-semibold text-gray-900">{formatValue(netIncomeSummary.revenue)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <IconDollar className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <div>
                                    <span className="text-xs text-gray-500">Expenses</span>
                                    <p className="text-lg font-semibold text-red-600">-{formatValue(netIncomeSummary.total_expenses)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <IconDollar className="mt-0.5 h-5 w-5 shrink-0" style={{ color: primaryColor }} />
                                <div>
                                    <span className="text-xs text-gray-500">Net income</span>
                                    <p className="text-lg font-semibold" style={{ color: primaryColor }}>{formatValue(netIncomeSummary.net_income)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <IconUsers className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <div>
                                    <span className="text-xs text-gray-500">Salary payments</span>
                                    <p className="text-lg font-semibold text-amber-600">-{formatValue(netIncomeSummary.salary_payments)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <IconCreditCard className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                                <div>
                                    <span className="text-xs text-gray-500">Net after compensation</span>
                                    <p className="text-lg font-semibold text-gray-900">{formatValue(netIncomeSummary.net_after_compensation)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sales vs Expenses */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                        <IconShoppingBag className="h-5 w-5" style={{ color: primaryColor }} />
                        Sales vs Expenses
                    </h3>
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

                {/* Expenses Pie Chart & Sales by Hour - 2 columns */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Expenses by Category - Pie Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                            <IconFolder className="h-5 w-5" style={{ color: secondaryColor }} />
                            Expenses by Category
                        </h3>
                        {expensesByCategory?.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {expensesByCategory.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatValue(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No expense data yet.</p>
                        )}
                    </div>

                    {/* Sales by Hour */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                            <IconDollar className="h-5 w-5" style={{ color: primaryColor }} />
                            Sales by Hour
                        </h3>
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

                {/* Top Products Datatable with Date Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                        <IconShoppingBag className="h-5 w-5" style={{ color: primaryColor }} />
                        Top Products Selling
                    </h3>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            value={filters.from_date ?? ''}
                            onChange={(e) => applyFilters({ from_date: e.target.value || undefined })}
                            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            value={filters.to_date ?? ''}
                            onChange={(e) => applyFilters({ to_date: e.target.value || undefined })}
                            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => applyFilters({ from_date: undefined, to_date: undefined })}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Clear
                        </button>
                    </div>
                    {topProducts?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Quantity Sold</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {topProducts.map((row, idx) => (
                                        <tr key={row.product_id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{row.product_name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-600">{formatValue(row.total_quantity)}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-gray-900">{formatValue(row.total_revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No product sales data for the selected date range.</p>
                    )}
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
