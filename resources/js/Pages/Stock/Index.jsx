import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconFolder,
    IconPencil,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const IconArchive = ({ className = '' }) => (
    <svg className={`h-5 w-5 shrink-0 ${className}`.trim()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

const IconHistory = ({ className = '' }) => (
    <svg className={`h-5 w-5 shrink-0 ${className}`.trim()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function StockIndex({ project, products, categories, filters, can }) {
    const [adjustingProduct, setAdjustingProduct] = useState(null);

    const adjustForm = useForm({
        quantity: '',
        reason: '',
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.stock.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const openAdjustModal = (product) => {
        setAdjustingProduct(product);
        adjustForm.setData({ quantity: '', reason: '' });
    };

    const handleAdjust = (e) => {
        e.preventDefault();
        if (!adjustingProduct) return;
        adjustForm.post(route('projects.modules.stock.adjust', [project.id, adjustingProduct.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setAdjustingProduct(null);
            },
        });
    };

    const selectClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
    const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <IconArchive className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Stock Management</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Track inventory and stock levels</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can?.viewHistory && (
                            <Link
                                href={route('projects.modules.stock.movements', project.id)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <IconHistory className="h-4 w-4" />
                                Movement History
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Stock`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <IconFolder className="text-gray-500" />
                    <select
                        value={filters?.category_id || ''}
                        onChange={(e) => applyFilters({ ...filters, category_id: e.target.value || undefined })}
                        className={selectClass + ' max-w-[180px]'}
                    >
                        <option value="">All categories</option>
                        {categories?.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filters?.low_stock || false}
                            onChange={(e) => applyFilters({ ...filters, low_stock: e.target.checked || undefined })}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">Low stock only</span>
                    </label>
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    <select
                        value={filters?.is_active ?? ''}
                        onChange={(e) => {
                            const v = e.target.value;
                            applyFilters({ ...filters, is_active: v === '' ? undefined : v === '1' });
                        }}
                        className={selectClass + ' max-w-[120px]'}
                    >
                        <option value="">All status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Min. Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {products?.data?.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{p.name}</div>
                                    {p.supplier && (
                                        <div className="text-sm text-gray-500">{p.supplier.name}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {p.category ? (
                                        <span
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{ backgroundColor: (p.category.color || '#e5e7eb') + '40', color: p.category.color || '#374151' }}
                                        >
                                            {p.category.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {p.stock_quantity} {p.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {p.minimum_stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {p.is_low_stock ? (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                            Low stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                                            OK
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {p.can_adjust && (
                                        <button
                                            type="button"
                                            onClick={() => openAdjustModal(p)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            <IconPencil className="inline h-4 w-4" /> Adjust
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!products?.data || products.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconArchive className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No products yet.</p>
                        <p className="mt-1 text-sm">Add products in the Products module to track stock.</p>
                        <Link
                            href={route('projects.modules.products.index', project.id)}
                            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Go to Products →
                        </Link>
                    </div>
                )}
            </div>

            {/* Adjust Stock Modal */}
            {adjustingProduct && (
                <Modal show onClose={() => setAdjustingProduct(null)} maxWidth="md">
                    <form onSubmit={handleAdjust} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Adjust Stock</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {adjustingProduct.name} — Current: {adjustingProduct.stock_quantity} {adjustingProduct.unit}
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Quantity (positive to add, negative to remove)" />
                                <TextInput
                                    type="number"
                                    value={adjustForm.data.quantity}
                                    onChange={(e) => adjustForm.setData('quantity', e.target.value)}
                                    className="block w-full"
                                    placeholder="e.g. 10 or -5"
                                    required
                                />
                                <InputError message={adjustForm.errors.quantity} />
                            </div>
                            <div>
                                <InputLabel value="Reason (optional)" />
                                <TextInput
                                    value={adjustForm.data.reason}
                                    onChange={(e) => adjustForm.setData('reason', e.target.value)}
                                    className="block w-full"
                                    placeholder="e.g. Inventory count, damaged goods"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setAdjustingProduct(null)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={adjustForm.processing}>
                                Apply Adjustment
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {products?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {products.data.length} of {products.meta.total} products
                    </p>
                    <div className="flex gap-2">
                        {products.links?.map((link, i) => (
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
