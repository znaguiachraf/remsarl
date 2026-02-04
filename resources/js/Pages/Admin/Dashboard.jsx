import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ stats }) {
    const cards = [
        { label: 'Users', value: stats?.users ?? 0, href: null },
        { label: 'Projects', value: stats?.projects ?? 0, href: null },
        { label: 'Assignments', value: stats?.assignments ?? 0, href: route('admin.workers.index') },
        { label: 'Roles', value: stats?.roles ?? 0, href: route('admin.roles.index') },
    ];

    return (
        <AdminLayout
            header={
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                        {card.href && (
                            <Link
                                href={card.href}
                                className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                View →
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
