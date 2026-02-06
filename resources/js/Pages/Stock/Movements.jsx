import ProjectLayout from '@/Layouts/ProjectLayout';
import {
    IconArrowLeft,
    IconCalendar,
    IconFolder,
    IconTag,
} from '@/Components/expense/Icons';
import { Head, Link, router, usePage } from '@inertiajs/react';

const IconArchive = ({ className = '' }) => (
    <svg className={`h-5 w-5 shrink-0 ${className}`.trim()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

export default function StockMovements({ project, movements, products, filters }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.stock.movements', project.id), newFilters, {
            preserveState: true,
        });
    };

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    const typeColors = {
        in: 'bg-emerald-100 text-emerald-800',
        out: 'bg-red-100 text-red-800',
        adjustment: 'bg-amber-100 text-amber-800',
    };

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.modules.stock.index', project.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <IconArrowLeft className="h-5 w-5" />
                        </Link>
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${primaryColor}26`, color: primaryColor }}
                        >
                            <IconArchive className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Stock Movement History</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Track all stock movements</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Stock Movements`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <IconFolder className="text-gray-500" />
                    <select
                        value={filters?.product_id || ''}
                        onChange={(e) => applyFilters({ ...filters, product_id: e.target.value || undefined })}
                        className={selectClass + ' max-w-[200px]'}
                    >
                        <option value="">All products</option>
                        {products?.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <IconTag className="text-gray-500" />
                    <select
                        value={filters?.type || ''}
                        onChange={(e) => applyFilters({ ...filters, type: e.target.value || undefined })}
                        className={selectClass + ' max-w-[140px]'}
                    >
                        <option value="">All types</option>
                        <option value="in">In</option>
                        <option value="out">Out</option>
                        <option value="adjustment">Adjustment</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {movements?.data?.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(m.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {m.product_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[m.type] || 'bg-gray-100 text-gray-800'}`}>
                                        {m.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {m.reference || '—'}
                                    {m.sale && (
                                        <span className="ml-1 text-xs text-gray-400">({m.sale.sale_number})</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {m.user?.name || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!movements?.data || movements.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconArchive className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No movements yet.</p>
                        <p className="mt-1 text-sm">Stock movements will appear here when you make adjustments or complete sales.</p>
                    </div>
                )}
            </div>

            {movements?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {movements.data.length} of {movements.meta.total} movements
                    </p>
                    <div className="flex gap-2">
                        {movements.links?.map((link, i) => (
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
