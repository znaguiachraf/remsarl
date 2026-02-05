import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconDollar,
    IconFolder,
    IconPencil,
    IconPlus,
    IconTag,
    IconTrash,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ProductsIndex({ project, products, categories, suppliers, filters, can }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);

    const createForm = useForm({
        product_category_id: '',
        name: '',
        barcode: '',
        description: '',
        price: '',
        cost_price: '',
        unit: 'pcs',
        supplier_id: '',
        is_active: true,
    });

    const editForm = useForm({
        product_category_id: '',
        name: '',
        barcode: '',
        description: '',
        price: '',
        cost_price: '',
        unit: 'pcs',
        supplier_id: '',
        is_active: true,
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.products.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('projects.modules.products.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        editForm.setData({
            product_category_id: product.category?.id?.toString() || '',
            name: product.name,
            barcode: product.barcode || '',
            description: product.description || '',
            price: product.price.toString(),
            cost_price: product.cost_price != null ? product.cost_price.toString() : '',
            unit: product.unit || 'pcs',
            supplier_id: product.supplier?.id?.toString() || '',
            is_active: product.is_active,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingProduct) return;
        editForm.patch(route('projects.modules.products.update', [project.id, editingProduct.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingProduct(null),
        });
    };

    const handleToggleStatus = (product) => {
        router.patch(route('projects.modules.products.update', [project.id, product.id]), {
            product_category_id: product.category?.id?.toString() || '',
            name: product.name,
            barcode: product.barcode || '',
            description: product.description || '',
            price: product.price,
            cost_price: product.cost_price ?? '',
            unit: product.unit || 'pcs',
            supplier_id: product.supplier?.id?.toString() || '',
            is_active: !product.is_active,
        }, { preserveScroll: true });
    };

    const handleDelete = (product) => {
        router.delete(route('projects.modules.products.destroy', [project.id, product.id]), {
            preserveScroll: true,
            onSuccess: () => setDeletingProduct(null),
        });
    };

    const selectClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
    const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                            <IconTag className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Manage product catalog</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can?.manageCategories && (
                            <Link
                                href={route('projects.modules.products.categories.index', project.id)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <IconFolder />
                                Categories
                            </Link>
                        )}
                        {can?.create && (
                            <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Add Product
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Products`} />

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
                    <span className="text-sm text-gray-500">Status</span>
                    <select
                        value={filters?.is_active ?? ''}
                        onChange={(e) => {
                            const v = e.target.value;
                            applyFilters({ ...filters, is_active: v === '' ? undefined : v === '1' });
                        }}
                        className={selectClass + ' max-w-[120px]'}
                    >
                        <option value="">All</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {products?.data?.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{p.name}</div>
                                        {p.barcode && (
                                            <div className="text-sm text-gray-500">{p.barcode}</div>
                                        )}
                                    </div>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {p.supplier?.name || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(p.price).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {p.stock_quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleStatus(p)}
                                        disabled={!p.can_update}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${p.is_active ? 'bg-indigo-600' : 'bg-gray-200'} ${!p.can_update && 'cursor-not-allowed opacity-60'}`}
                                        role="switch"
                                        aria-checked={p.is_active}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${p.is_active ? 'translate-x-5' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {p.can_update && (
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(p)}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                                <IconPencil className="inline h-4 w-4" /> Edit
                                            </button>
                                        )}
                                        {p.can_delete && (
                                            <button
                                                type="button"
                                                onClick={() => setDeletingProduct(p)}
                                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                            >
                                                <IconTrash className="inline h-4 w-4" /> Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!products?.data || products.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconTag className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No products yet.</p>
                        <p className="mt-1 text-sm">Add your first product to get started.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <Modal show onClose={() => setShowCreateModal(false)} maxWidth="md">
                    <form onSubmit={handleCreate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Product</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Category" />
                                <select
                                    value={createForm.data.product_category_id}
                                    onChange={(e) => createForm.setData('product_category_id', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    <option value="">None</option>
                                    {categories?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Name" />
                                <TextInput
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                                <InputError message={createForm.errors.name} />
                            </div>
                            <div>
                                <InputLabel value="Barcode" />
                                <TextInput
                                    value={createForm.data.barcode}
                                    onChange={(e) => createForm.setData('barcode', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <textarea
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Price" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', e.target.value)}
                                        className="block w-full"
                                        required
                                    />
                                    <InputError message={createForm.errors.price} />
                                </div>
                                <div>
                                    <InputLabel value="Cost Price" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={createForm.data.cost_price}
                                        onChange={(e) => createForm.setData('cost_price', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Unit" />
                                    <select
                                        value={createForm.data.unit}
                                        onChange={(e) => createForm.setData('unit', e.target.value)}
                                        className={selectClass + ' w-full'}
                                    >
                                        <option value="pcs">pcs</option>
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="l">l</option>
                                        <option value="ml">ml</option>
                                        <option value="box">box</option>
                                        <option value="pack">pack</option>
                                    </select>
                                </div>
                                <div>
                                    <InputLabel value="Default Supplier" />
                                    <select
                                        value={createForm.data.supplier_id}
                                        onChange={(e) => createForm.setData('supplier_id', e.target.value)}
                                        className={selectClass + ' w-full'}
                                    >
                                        <option value="">None</option>
                                        {suppliers?.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="create_is_active"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <InputLabel htmlFor="create_is_active">Active</InputLabel>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={createForm.processing}>Create</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <Modal show onClose={() => setEditingProduct(null)} maxWidth="md">
                    <form onSubmit={handleUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Category" />
                                <select
                                    value={editForm.data.product_category_id}
                                    onChange={(e) => editForm.setData('product_category_id', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    <option value="">None</option>
                                    {categories?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Name" />
                                <TextInput
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div>
                                <InputLabel value="Barcode" />
                                <TextInput
                                    value={editForm.data.barcode}
                                    onChange={(e) => editForm.setData('barcode', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <textarea
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Price" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                        className="block w-full"
                                        required
                                    />
                                    <InputError message={editForm.errors.price} />
                                </div>
                                <div>
                                    <InputLabel value="Cost Price" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editForm.data.cost_price}
                                        onChange={(e) => editForm.setData('cost_price', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Unit" />
                                    <select
                                        value={editForm.data.unit}
                                        onChange={(e) => editForm.setData('unit', e.target.value)}
                                        className={selectClass + ' w-full'}
                                    >
                                        <option value="pcs">pcs</option>
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="l">l</option>
                                        <option value="ml">ml</option>
                                        <option value="box">box</option>
                                        <option value="pack">pack</option>
                                    </select>
                                </div>
                                <div>
                                    <InputLabel value="Default Supplier" />
                                    <select
                                        value={editForm.data.supplier_id}
                                        onChange={(e) => editForm.setData('supplier_id', e.target.value)}
                                        className={selectClass + ' w-full'}
                                    >
                                        <option value="">None</option>
                                        {suppliers?.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_active"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <InputLabel htmlFor="edit_is_active">Active</InputLabel>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setEditingProduct(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>Save</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {deletingProduct && (
                <Modal show onClose={() => setDeletingProduct(null)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete &quot;{deletingProduct.name}&quot;? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton onClick={() => setDeletingProduct(null)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={() => handleDelete(deletingProduct)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
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
