import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ stats, projects = [] }) {
    const cards = [
        { label: 'Users', value: stats?.users ?? 0, href: route('admin.users.index'), icon: 'users' },
        { label: 'Projects', value: stats?.projects ?? 0, href: route('admin.modules.index'), icon: 'projects' },
        { label: 'Assignments', value: stats?.assignments ?? 0, href: route('admin.workers.index'), icon: 'workers' },
        { label: 'Modules', value: stats?.projects ?? 0, href: route('admin.modules.index'), icon: 'modules' },
        { label: 'Roles', value: stats?.roles ?? 0, href: route('admin.roles.index'), icon: 'roles' },
    ];

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

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-indigo-50 p-2">
                                <AdminIcon icon={card.icon} className="w-5 h-5 text-indigo-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
                        {card.href && (
                            <Link
                                href={card.href}
                                className="mt-3 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                <AdminIcon icon="view" className="w-4 h-4" />
                                View
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {projects?.length > 0 && (
                <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Project Colors</h2>
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
                                <span className="text-indigo-600">Edit colors</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
