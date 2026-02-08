import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ kpis = [], alerts = [], quickActions = [], projects = [] }) {
    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <AdminIcon icon="dashboard" className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                {/* KPIs */}
                <div>
                    <h2 className="mb-4 text-base font-semibold text-gray-900">Key metrics</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {kpis.map((kpi) => (
                            <div
                                key={kpi.key}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerts */}
                {alerts?.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-base font-semibold text-gray-900">Alerts</h2>
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
                                    <AdminIcon
                                        icon={alert.severity === 'warning' ? 'warning' : 'info'}
                                        className="h-5 w-5 shrink-0"
                                    />
                                    <span className="flex-1 text-sm font-medium">{alert.message}</span>
                                    <span className="text-sm font-medium text-indigo-600">View →</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                {quickActions?.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-base font-semibold text-gray-900">Quick actions</h2>
                        <div className="flex flex-wrap gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.key}
                                    href={action.href}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <AdminIcon icon={action.icon} className="h-5 w-5" />
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Project colors - contextual quick action */}
                {projects?.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Edit project colors</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Customize primary and secondary colors for each project.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {projects.map((p) => (
                                <Link
                                    key={p.id}
                                    href={route('admin.projects.edit', p.id)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                                >
                                    <span
                                        className="h-4 w-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: p.primary_color || '#3B82F6' }}
                                    />
                                    {p.name}
                                    <span className="text-indigo-600">Edit</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
