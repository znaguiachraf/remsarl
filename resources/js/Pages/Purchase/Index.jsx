import ProjectLayout from '@/Layouts/ProjectLayout';
import {
    IconDocument,
    IconPlus,
    IconSearch,
    IconShoppingBag,
    IconTag,
    IconTruck,
} from '@/Components/expense/Icons';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    partial: 'bg-amber-100 text-amber-800',
    received: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function PurchaseIndex({ project, orders, suppliers, filters, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.purchase.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <IconShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Purchase Orders</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Manage purchase orders and receiving</p>
                        </div>
                    </div>
                    {can?.create && (
                        <Link
                            href={route('projects.modules.purchase.create', project.id)}
                            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <IconPlus className="h-4 w-4" />
                            New Purchase Order
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={`${project?.name} - Purchase Orders`} />

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <IconTag className="h-5 w-5 text-gray-500" />
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                        className={selectClass + ' max-w-[140px]'}
                    >
                        <option value="">All status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="partial">Partial</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <IconTruck className="h-5 w-5 text-gray-500" />
                    <select
                        value={filters?.supplier_id || ''}
                        onChange={(e) => applyFilters({ ...filters, supplier_id: e.target.value || undefined })}
                        className={selectClass + ' max-w-[180px]'}
                    >
                        <option value="">All suppliers</option>
                        {suppliers?.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-4">
                    <IconSearch className="h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search PO or supplier..."
                        value={filters?.search || ''}
                        onChange={(e) => applyFilters({ ...filters, search: e.target.value || undefined })}
                        className={inputClass + ' max-w-[200px]'}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {orders?.data?.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <Link
                                        href={route('projects.modules.purchase.show', [project.id, o.id])}
                                        className="font-medium transition hover:opacity-80"
                                        style={{ color: primaryColor }}
                                    >
                                        {o.order_number}
                                    </Link>
                                    {o.bill_reference && (
                                        <div className="text-xs text-gray-500">Bill: {o.bill_reference}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {o.supplier?.name ?? '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {o.ordered_at ?? '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                    {Number(o.total).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        href={route('projects.modules.purchase.show', [project.id, o.id])}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80"
                                        style={{ color: primaryColor }}
                                    >
                                        <IconDocument className="h-4 w-4" />
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!orders?.data || orders.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconShoppingBag className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No purchase orders yet.</p>
                        <p className="mt-1 text-sm">{can?.create ? 'Create your first purchase order to get started.' : ''}</p>
                    </div>
                )}
            </div>

            {orders?.meta?.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing {orders.data.length} of {orders.meta.total} orders
                    </p>
                    <div className="flex gap-2">
                        {orders.links?.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${link.active ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'} ${!link.url && 'pointer-events-none opacity-50'}`}
                                style={link.active ? { backgroundColor: `${primaryColor}26`, color: primaryColor } : {}}
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
