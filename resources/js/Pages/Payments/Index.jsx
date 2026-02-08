import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconCalendar,
    IconCreditCard,
    IconDollar,
    IconDocument,
    IconPencil,
    IconTag,
    IconTrash,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    paid: 'bg-emerald-100 text-emerald-800',
    partial: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-600',
};

export default function PaymentsIndex({ project, payments, filters, filterOptions, can }) {
    const paymentMethods = usePage().props.payment_methods || [];
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [viewingPayment, setViewingPayment] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [deletingPayment, setDeletingPayment] = useState(null);

    const editForm = useForm({
        payment_method: 'cash',
        amount: '',
        reference: '',
        payment_date: '',
        notes: '',
        status: 'paid',
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.payments.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleRefund = (payment) => {
        if (!confirm('Are you sure you want to refund this payment?')) return;
        router.post(
            route('projects.modules.payments.refund', [project.id, payment.id]),
            {},
            { preserveScroll: true, onSuccess: () => setViewingPayment(null) }
        );
    };

    const handleReinstate = (payment) => {
        if (!confirm('Mark this payment as paid again?')) return;
        router.post(
            route('projects.modules.payments.reinstate', [project.id, payment.id]),
            {},
            { preserveScroll: true, onSuccess: () => setViewingPayment(null) }
        );
    };

    const openEditModal = (payment) => {
        setEditingPayment(payment);
        editForm.setData({
            payment_method: payment.payment_method,
            amount: payment.amount.toString(),
            reference: payment.reference || '',
            payment_date: payment.payment_date,
            notes: payment.notes || '',
            status: payment.status === 'refunded' ? 'paid' : payment.status,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingPayment) return;
        editForm.patch(route('projects.modules.payments.update', [project.id, editingPayment.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingPayment(null),
        });
    };

    const handleDelete = (payment) => {
        router.delete(route('projects.modules.payments.destroy', [project.id, payment.id]), {
            preserveScroll: true,
            onSuccess: () => setDeletingPayment(null),
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
                            <IconCreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Payments</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Payments from sales</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Payments`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                        className={selectClass + ' max-w-[120px]'}
                    >
                        <option value="">All statuses</option>
                        {filterOptions?.statuses?.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <IconTag className="text-gray-500" />
                    <select
                        value={filters?.payment_method || ''}
                        onChange={(e) => applyFilters({ ...filters, payment_method: e.target.value || undefined })}
                        className={selectClass + ' max-w-[120px]'}
                    >
                        <option value="">All methods</option>
                        {paymentMethods.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
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

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sale</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                            <th className="px-4 py-3 sm:px-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50 sticky right-0 shrink-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {payments?.data?.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-600">{p.payment_date}</td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-900">{p.sale_label}</td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(p.amount).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-600 capitalize">{p.payment_method}</td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {p.status_label}
                                    </span>
                                </td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-600">{p.user?.name || '—'}</td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right bg-white sticky right-0 shrink-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] min-w-[100px]">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setViewingPayment(p)}
                                            className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 rounded transition hover:opacity-80 shrink-0"
                                            style={{ color: primaryColor }}
                                            title="View"
                                        >
                                            <IconDocument className="h-4 w-4" />
                                            <span className="hidden sm:inline sm:ml-0.5">View</span>
                                        </button>
                                        {p.can_update && p.status !== 'refunded' && (
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(p)}
                                                className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 text-gray-600 hover:text-gray-500 rounded shrink-0"
                                                title="Edit"
                                            >
                                                <IconPencil className="h-4 w-4" />
                                                <span className="hidden sm:inline sm:ml-0.5">Edit</span>
                                            </button>
                                        )}
                                        {p.can_refund && p.status !== 'refunded' && (
                                            <button
                                                type="button"
                                                onClick={() => handleRefund(p)}
                                                className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 text-red-600 hover:text-red-500 rounded shrink-0 text-sm font-medium"
                                                title="Refund"
                                            >
                                                <span className="hidden sm:inline">Refund</span>
                                                <span className="sm:hidden">Ref</span>
                                            </button>
                                        )}
                                        {p.can_reinstate && p.status === 'refunded' && (
                                            <button
                                                type="button"
                                                onClick={() => handleReinstate(p)}
                                                className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 text-emerald-600 hover:text-emerald-500 rounded shrink-0 text-sm font-medium"
                                                title="Reinstate"
                                            >
                                                Pay
                                            </button>
                                        )}
                                        {p.can_delete && (
                                            <button
                                                type="button"
                                                onClick={() => setDeletingPayment(p)}
                                                className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 text-red-600 hover:text-red-500 hover:bg-red-50 rounded shrink-0"
                                                title="Delete"
                                            >
                                                <IconTrash className="h-4 w-4" />
                                                <span className="hidden sm:inline sm:ml-0.5">Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!payments?.data || payments.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconCreditCard className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No payments yet.</p>
                        <p className="mt-1 text-sm">Payments are created automatically when sales are completed.</p>
                    </div>
                )}
            </div>

            {/* View Payment Modal */}
            {viewingPayment && (
                <Modal show onClose={() => setViewingPayment(null)} maxWidth="md">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                        <dl className="mt-4 space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">{viewingPayment.payment_date}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Sale</dt>
                                <dd className="mt-1 text-sm text-gray-900">{viewingPayment.sale_label}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900">{Number(viewingPayment.amount).toLocaleString()}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Method</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{viewingPayment.payment_method}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[viewingPayment.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {viewingPayment.status_label}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">User</dt>
                                <dd className="mt-1 text-sm text-gray-900">{viewingPayment.user?.name || '—'}</dd>
                            </div>
                            {viewingPayment.reference && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Reference</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{viewingPayment.reference}</dd>
                                </div>
                            )}
                            {viewingPayment.notes && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{viewingPayment.notes}</dd>
                                </div>
                            )}
                        </dl>
                        <div className="mt-6 flex justify-end gap-2">
                            {viewingPayment.can_update && viewingPayment.status !== 'refunded' && (
                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        openEditModal(viewingPayment);
                                        setViewingPayment(null);
                                    }}
                                >
                                    <IconPencil className="inline h-4 w-4" /> Edit
                                </SecondaryButton>
                            )}
                            {viewingPayment.can_refund && viewingPayment.status !== 'refunded' && (
                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        handleRefund(viewingPayment);
                                        setViewingPayment(null);
                                    }}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    Refund
                                </SecondaryButton>
                            )}
                            {viewingPayment.can_reinstate && viewingPayment.status === 'refunded' && (
                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        handleReinstate(viewingPayment);
                                        setViewingPayment(null);
                                    }}
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                >
                                    Pay
                                </SecondaryButton>
                            )}
                            {viewingPayment.can_delete && (
                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        setDeletingPayment(viewingPayment);
                                        setViewingPayment(null);
                                    }}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <IconTrash className="inline h-4 w-4" /> Delete
                                </SecondaryButton>
                            )}
                            <SecondaryButton onClick={() => setViewingPayment(null)}>Close</SecondaryButton>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Payment Modal */}
            {editingPayment && (
                <Modal show onClose={() => setEditingPayment(null)} maxWidth="md">
                    <form onSubmit={handleUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Payment</h3>
                        <p className="mt-1 text-sm text-gray-500">{editingPayment.sale_label}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editForm.data.amount}
                                    onChange={(e) => editForm.setData('amount', e.target.value)}
                                    className="block w-full"
                                />
                                <InputError message={editForm.errors.amount} />
                            </div>
                            <div>
                                <InputLabel value="Payment Method" />
                                <select
                                    value={editForm.data.payment_method}
                                    onChange={(e) => editForm.setData('payment_method', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    {paymentMethods.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Status" />
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    <option value="paid">Paid</option>
                                    <option value="partial">Partial</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Reference" />
                                <TextInput
                                    value={editForm.data.reference}
                                    onChange={(e) => editForm.setData('reference', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Payment Date" />
                                <TextInput
                                    type="date"
                                    value={editForm.data.payment_date}
                                    onChange={(e) => editForm.setData('payment_date', e.target.value)}
                                    className="block w-full"
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
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setEditingPayment(null)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Payment Confirmation Modal */}
            {deletingPayment && (
                <Modal show onClose={() => setDeletingPayment(null)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Payment</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete this payment? This will remove the payment record from Sale {deletingPayment.sale_label}.
                        </p>
                        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                            <p><strong>Amount:</strong> {Number(deletingPayment.amount).toLocaleString()}</p>
                            <p><strong>Sale:</strong> {deletingPayment.sale_label}</p>
                            <p><strong>Date:</strong> {deletingPayment.payment_date}</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setDeletingPayment(null)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                type="button"
                                onClick={() => handleDelete(deletingPayment)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                                Delete Payment
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            )}

            {payments?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {payments.data.length} of {payments.meta.total} payments
                    </p>
                    <div className="flex gap-2">
                        {payments.links?.map((link, i) => (
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
