import ProjectLayout from '@/Layouts/ProjectLayout';
import {
    IconCalendar,
    IconDollar,
    IconDocument,
    IconPlus,
    IconTag,
} from '@/Components/expense/Icons';
import { Head, Link, router } from '@inertiajs/react';

const paymentStatusColors = {
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-600',
    refunded: 'bg-gray-100 text-gray-600',
};

export default function SalesIndex({ project, sales, filters, can }) {
    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.sales.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const selectClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
    const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <IconDollar className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Sales</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Invoices and orders</p>
                        </div>
                    </div>
                    {can?.create && (
                        <Link
                            href={route('projects.modules.sales.create', project.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <IconPlus className="h-4 w-4" />
                            New Sale
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={`${project?.name} - Sales`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <IconTag className="text-gray-500" />
                    <select
                        value={filters?.payment_status || ''}
                        onChange={(e) => applyFilters({ ...filters, payment_status: e.target.value || undefined })}
                        className={selectClass + ' max-w-[140px]'}
                    >
                        <option value="">All payment status</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                        className={selectClass + ' max-w-[140px]'}
                    >
                        <option value="">All status</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
                <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-4">
                    <IconCalendar className="text-gray-500" />
                    <input
                        type="date"
                        value={filters?.from_date || ''}
                        onChange={(e) => applyFilters({ ...filters, from_date: e.target.value || undefined })}
                        className={inputClass + ' max-w-[140px]'}
                    />
                    <span className="text-gray-400">–</span>
                    <input
                        type="date"
                        value={filters?.to_date || ''}
                        onChange={(e) => applyFilters({ ...filters, to_date: e.target.value || undefined })}
                        className={inputClass + ' max-w-[140px]'}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sale</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {sales?.data?.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <Link
                                        href={route('projects.modules.sales.show', [project.id, s.id])}
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        {s.sale_number}
                                    </Link>
                                    <div className="text-sm text-gray-500">{s.items_count} item(s)</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(s.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(s.total).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {Number(s.total_paid).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${paymentStatusColors[s.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                                        {s.payment_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        href={route('projects.modules.sales.show', [project.id, s.id])}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        <IconDocument className="inline h-4 w-4" /> View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!sales?.data || sales.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconDollar className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No sales yet.</p>
                        <p className="mt-1 text-sm">Create your first sale to get started.</p>
                        {can?.create && (
                            <Link
                                href={route('projects.modules.sales.create', project.id)}
                                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                New Sale →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {sales?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {sales.data.length} of {sales.meta.total} sales
                    </p>
                    <div className="flex gap-2">
                        {sales.links?.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-600 hover:bg-gray-100'} ${!link.url && 'pointer-events-none opacity-50'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </ProjectLayout>
    );
}
