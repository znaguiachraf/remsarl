import ProjectLayout from '@/Layouts/ProjectLayout';
import { Head, Link } from '@inertiajs/react';
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

const iconPaths = {
    'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    plus: 'M12 4v16m8-8H4',
    'shopping-cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    'dollar-sign': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    'exclamation-triangle': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    'information-circle': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

function Icon({ name, className = 'w-5 h-5' }) {
    const path = iconPaths[name] || iconPaths.package;
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
        </svg>
    );
}

function formatValue(value) {
    return Number(value).toLocaleString();
}

export default function ProjectDashboard({ project, kpis = [], alerts = [], quickActions = [], chartData = [], employeeNotes = [] }) {
    const primaryColor = project?.primary_color || '#3B82F6';

    return (
        <ProjectLayout>
            <Head title={`${project?.name} - Dashboard`} />

            <div className="space-y-5 sm:space-y-8" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                {/* Welcome banner */}
                <div
                    className="relative overflow-hidden rounded-xl px-4 py-5 shadow-lg sm:rounded-2xl sm:px-6 sm:py-8"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)`,
                    }}
                >
                    <div className="relative z-10">
                        <h3 className="text-lg font-semibold text-white/95 sm:text-xl">
                            Welcome to {project?.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/80 line-clamp-2 sm:line-clamp-none sm:max-w-xl">
                            {project?.description || 'Manage your business from one place.'}
                        </p>
                        <Link
                            href={route('projects.index')}
                            className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition active:scale-[0.98] hover:bg-white/30 touch-manipulation sm:mt-4 sm:min-h-0 sm:py-2"
                        >
                            Switch project
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </Link>
                    </div>
                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 sm:-right-8 sm:-top-8 sm:h-32 sm:w-32" />
                    <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white/5 sm:-bottom-4 sm:-right-4 sm:h-24 sm:w-24" />
                </div>

                {/* KPIs */}
                {kpis?.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4">Key metrics</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                            {kpis.map((kpi) => (
                                <Link
                                    key={kpi.key}
                                    href={kpi.href}
                                    className="flex min-h-[80px] flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-gray-200 hover:shadow-md touch-manipulation sm:min-h-0 sm:p-5"
                                >
                                    <p className="text-xs font-medium text-gray-500 sm:text-sm">{kpi.label}</p>
                                    <p className="mt-0.5 text-xl font-bold text-gray-900 sm:mt-1 sm:text-2xl">
                                        {formatValue(kpi.value)}
                                    </p>
                                    {kpi.subtext && (
                                        <p className="mt-0.5 text-xs text-amber-600 sm:text-sm">{kpi.subtext}</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Alerts */}
                {alerts?.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4">Alerts</h3>
                        <div className="space-y-2">
                            {alerts.map((alert) => (
                                <Link
                                    key={alert.key}
                                    href={alert.href}
                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition hover:shadow-sm ${
                                        alert.severity === 'warning'
                                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                                            : 'border-blue-200 bg-blue-50 text-blue-800'
                                    }`}
                                >
                                    <Icon
                                        name={alert.severity === 'warning' ? 'exclamation-triangle' : 'information-circle'}
                                        className="h-5 w-5 shrink-0"
                                    />
                                    <span className="flex-1 text-sm font-medium">{alert.message}</span>
                                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sales & Expenses chart */}
                {chartData?.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4">Sales & expenses</h3>
                        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                            <div className="h-64 sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 12 }}
                                            stroke="#6b7280"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            stroke="#6b7280"
                                            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                                        />
                                        <Tooltip
                                            formatter={(value) => formatValue(value)}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="sales"
                                            name="Sales"
                                            fill={primaryColor}
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="expenses"
                                            name="Expenses"
                                            fill={project?.secondary_color || '#10B981'}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employee Notes widget */}
                {(
                    <div>
                        {/* <div className="mb-3 flex items-center justify-between sm:mb-4">
                            <h3 className="text-base font-semibold text-gray-900">Employee notes</h3>
                            <Link
                                href={route('projects.notes.index', project?.id)}
                                className="text-sm font-medium"
                                style={{ color: primaryColor }}
                            >
                                View all →
                            </Link>
                        </div> */}
                        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                            {employeeNotes?.length > 0 ? (
                                <div className="space-y-3">
                                    {employeeNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="rounded-lg border-l-4 border-gray-200 bg-gray-50/50 px-3 py-2"
                                            style={{ borderLeftColor: note.direction === 'to_employee' ? primaryColor : (project?.secondary_color || '#10B981') }}
                                        >
                                            <p className="text-sm text-gray-700">{note.content}</p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {note.worker_name} · {note.direction === 'to_employee' ? 'To employee' : 'From employee'} · {note.author_name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No notes yet. Add a note to or from an employee.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                {quickActions?.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4">Quick actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.key}
                                    href={action.href}
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition active:scale-[0.98] hover:border-gray-300 hover:bg-gray-50 touch-manipulation"
                                    style={{ borderColor: primaryColor + '40' }}
                                >
                                    <Icon name={action.icon} className="h-5 w-5" style={{ color: primaryColor }} />
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state when no module-specific data */}
                {kpis?.length === 0 && alerts?.length === 0 && quickActions?.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center sm:p-12">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 sm:h-12 sm:w-12">
                            <Icon name="package" className="h-5 w-5 text-gray-400 sm:h-6 sm:w-6" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-600 sm:mt-4 sm:text-base">
                            No metrics yet
                        </p>
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Enable modules (Sales, POS, Products, etc.) in project settings to see KPIs and quick actions here.
                        </p>
                    </div>
                )}
            </div>
        </ProjectLayout>
    );
}
