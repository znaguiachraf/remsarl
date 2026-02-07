import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconPencil,
    IconPlus,
    IconTruck,
    IconTrash,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SuppliersIndex({ project, suppliers, filters, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [deletingSupplier, setDeletingSupplier] = useState(null);

    const createForm = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.suppliers.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('projects.modules.suppliers.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        editForm.setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
            is_active: supplier.is_active,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingSupplier) return;
        editForm.patch(route('projects.modules.suppliers.update', [project.id, editingSupplier.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingSupplier(null),
        });
    };

    const handleDelete = (supplier) => {
        router.delete(route('projects.modules.suppliers.destroy', [project.id, supplier.id]), {
            preserveScroll: true,
            onSuccess: () => setDeletingSupplier(null),
        });
    };

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <IconTruck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Suppliers</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Manage suppliers and vendors</p>
                        </div>
                    </div>
                    {can?.create && (
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            <IconPlus className="h-4 w-4" />
                            Add Supplier
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title={`${project?.name} - Suppliers`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={filters?.search || ''}
                        onChange={(e) => applyFilters({ ...filters, search: e.target.value || undefined })}
                        className={inputClass + ' max-w-[200px]'}
                    />
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Products</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expenses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {suppliers?.data?.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <Link
                                        href={route('projects.modules.suppliers.show', [project.id, s.id])}
                                        className="font-medium text-gray-900 hover:underline"
                                        style={{ color: primaryColor }}
                                    >
                                        {s.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {s.contact_person || s.email || s.phone || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {s.products_count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {s.expenses_count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {s.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {s.can_update && (
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(s)}
                                                className="text-sm font-medium transition hover:opacity-80"
                                                style={{ color: primaryColor }}
                                            >
                                                <IconPencil className="inline h-4 w-4" /> Edit
                                            </button>
                                        )}
                                        {s.can_delete && (
                                            <button
                                                type="button"
                                                onClick={() => setDeletingSupplier(s)}
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
                {(!suppliers?.data || suppliers.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconTruck className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No suppliers yet.</p>
                        <p className="mt-1 text-sm">Add your first supplier to get started.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <Modal show onClose={() => setShowCreateModal(false)} maxWidth="md">
                    <form onSubmit={handleCreate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Supplier</h3>
                        <div className="mt-4 space-y-4">
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
                                <InputLabel value="Contact Person" />
                                <TextInput
                                    value={createForm.data.contact_person}
                                    onChange={(e) => createForm.setData('contact_person', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Email" />
                                    <TextInput
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="block w-full"
                                    />
                                    <InputError message={createForm.errors.email} />
                                </div>
                                <div>
                                    <InputLabel value="Phone" />
                                    <TextInput
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Address" />
                                <textarea
                                    value={createForm.data.address}
                                    onChange={(e) => createForm.setData('address', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea
                                    value={createForm.data.notes}
                                    onChange={(e) => createForm.setData('notes', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
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
            {editingSupplier && (
                <Modal show onClose={() => setEditingSupplier(null)} maxWidth="md">
                    <form onSubmit={handleUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Supplier</h3>
                        <div className="mt-4 space-y-4">
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
                                <InputLabel value="Contact Person" />
                                <TextInput
                                    value={editForm.data.contact_person}
                                    onChange={(e) => editForm.setData('contact_person', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Email" />
                                    <TextInput
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="block w-full"
                                    />
                                    <InputError message={editForm.errors.email} />
                                </div>
                                <div>
                                    <InputLabel value="Phone" />
                                    <TextInput
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Address" />
                                <textarea
                                    value={editForm.data.address}
                                    onChange={(e) => editForm.setData('address', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData('notes', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
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
                            <SecondaryButton type="button" onClick={() => setEditingSupplier(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>Save</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {deletingSupplier && (
                <Modal show onClose={() => setDeletingSupplier(null)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Supplier</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete &quot;{deletingSupplier.name}&quot;? Products and expenses linked to this supplier will not be deleted.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton onClick={() => setDeletingSupplier(null)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={() => handleDelete(deletingSupplier)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            )}

            {suppliers?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {suppliers.data.length} of {suppliers.meta.total} suppliers
                    </p>
                    <div className="flex gap-2">
                        {suppliers.links?.map((link, i) => (
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
