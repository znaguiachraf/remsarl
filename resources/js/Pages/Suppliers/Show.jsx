import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconArrowLeft,
    IconDollar,
    IconPencil,
    IconTag,
    IconTruck,
    IconTrash,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SuppliersShow({ project, supplier, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const editForm = useForm({
        name: supplier?.name || '',
        contact_person: supplier?.contact_person || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
        address: supplier?.address || '',
        notes: supplier?.notes || '',
        is_active: supplier?.is_active ?? true,
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!supplier) return;
        editForm.patch(route('projects.modules.suppliers.update', [project.id, supplier.id]), {
            preserveScroll: true,
            onSuccess: () => setShowEditModal(false),
        });
    };

    const handleDelete = () => {
        if (!supplier) return;
        router.delete(route('projects.modules.suppliers.destroy', [project.id, supplier.id]), {
            onSuccess: () => router.visit(route('projects.modules.suppliers.index', project.id)),
        });
    };

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    if (!supplier) return null;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.modules.suppliers.index', project.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <IconArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <IconTruck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">{supplier.name}</h2>
                            <p className="mt-0.5 text-sm text-gray-500">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${supplier.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can?.update && (
                            <PrimaryButton onClick={() => { setShowEditModal(true); editForm.setData({ name: supplier.name, contact_person: supplier.contact_person || '', email: supplier.email || '', phone: supplier.phone || '', address: supplier.address || '', notes: supplier.notes || '', is_active: supplier.is_active }); }}>
                                <IconPencil className="h-4 w-4" />
                                Edit
                            </PrimaryButton>
                        )}
                        {can?.delete && (
                            <SecondaryButton onClick={() => setShowDeleteModal(true)} className="border-red-200 text-red-700 hover:bg-red-50">
                                <IconTrash className="h-4 w-4" />
                                Delete
                            </SecondaryButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - ${supplier.name}`} />

            <div className="space-y-6">
                {/* Contact Info */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-medium text-gray-900">Contact Information</h3>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        {supplier.contact_person && (
                            <div>
                                <dt className="text-sm text-gray-500">Contact Person</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900">{supplier.contact_person}</dd>
                            </div>
                        )}
                        {supplier.email && (
                            <div>
                                <dt className="text-sm text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900">
                                    <a href={`mailto:${supplier.email}`} className="hover:underline" style={{ color: primaryColor }}>{supplier.email}</a>
                                </dd>
                            </div>
                        )}
                        {supplier.phone && (
                            <div>
                                <dt className="text-sm text-gray-500">Phone</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900">{supplier.phone}</dd>
                            </div>
                        )}
                        {supplier.address && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm text-gray-500">Address</dt>
                                <dd className="mt-1 text-sm text-gray-900">{supplier.address}</dd>
                            </div>
                        )}
                        {supplier.notes && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm text-gray-500">Notes</dt>
                                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{supplier.notes}</dd>
                            </div>
                        )}
                        {!supplier.contact_person && !supplier.email && !supplier.phone && !supplier.address && !supplier.notes && (
                            <p className="text-sm text-gray-500">No contact information added.</p>
                        )}
                    </dl>
                </div>

                {/* Linked Products */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <IconTag className="h-5 w-5 text-gray-500" />
                            Linked Products
                        </h3>
                        <Link
                            href={route('projects.modules.products.index', project.id)}
                            className="text-sm font-medium hover:underline"
                            style={{ color: primaryColor }}
                        >
                            View all products
                        </Link>
                    </div>
                    {supplier.products?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {supplier.products.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('projects.modules.products.index', project.id)}
                                                className="font-medium text-gray-900 hover:underline"
                                                style={{ color: primaryColor }}
                                            >
                                                {p.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                                            <IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(p.price).toLocaleString()} / {p.unit}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-gray-500">
                            No products linked to this supplier.
                        </div>
                    )}
                </div>

                {/* Linked Expenses */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <IconDollar className="h-5 w-5 text-gray-500" />
                            Recent Expenses
                        </h3>
                        <Link
                            href={route('projects.modules.expenses.index', project.id)}
                            className="text-sm font-medium hover:underline"
                            style={{ color: primaryColor }}
                        >
                            View all expenses
                        </Link>
                    </div>
                    {supplier.expenses?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {supplier.expenses.map((e) => (
                                    <tr key={e.id}>
                                        <td className="px-6 py-4 text-sm text-gray-600">{e.expense_date}</td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('projects.modules.expenses.index', project.id)}
                                                className="font-medium text-gray-900 hover:underline"
                                                style={{ color: primaryColor }}
                                            >
                                                {e.reference || e.description}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                                            <IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(e.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${e.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-gray-500">
                            No expenses linked to this supplier.
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <Modal show onClose={() => setShowEditModal(false)} maxWidth="md">
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
                            <SecondaryButton type="button" onClick={() => setShowEditModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>Save</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <Modal show onClose={() => setShowDeleteModal(false)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Supplier</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete &quot;{supplier.name}&quot;? Products and expenses linked to this supplier will not be deleted.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            )}
        </ProjectLayout>
    );
}
