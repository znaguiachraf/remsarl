import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconDocument,
    IconDollar,
    IconPackage,
    IconPencil,
    IconShoppingBag,
    IconTruck,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    partial: 'bg-amber-100 text-amber-800',
    received: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function PurchaseShow({ project, order, locations }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);

    const receiveForm = useForm({
        location_id: '',
        receipts: order?.items?.filter((i) => i.quantity_remaining > 0).map((i) => ({
            item_id: i.id,
            quantity: i.quantity_remaining,
        })) ?? [],
    });

    const billForm = useForm({
        bill_reference: order?.bill_reference || '',
        bill_amount: order?.bill_amount?.toString() || '',
    });

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    const handleReceive = (e) => {
        e.preventDefault();
        const validReceipts = receiveForm.data.receipts.filter((r) => r.quantity > 0);
        if (validReceipts.length === 0) {
            receiveForm.setError('receipts', 'Enter at least one quantity to receive.');
            return;
        }
        receiveForm.setData('receipts', validReceipts);
        receiveForm.post(route('projects.modules.purchase.receive', [project.id, order.id]), {
            preserveScroll: true,
            onSuccess: () => setShowReceiveModal(false),
        });
    };

    const handleBillUpdate = (e) => {
        e.preventDefault();
        billForm.patch(route('projects.modules.purchase.bill', [project.id, order.id]), {
            preserveScroll: true,
            onSuccess: () => setShowBillModal(false),
        });
    };

    const updateReceiptQty = (idx, qty) => {
        const next = [...receiveForm.data.receipts];
        next[idx] = { ...next[idx], quantity: parseInt(qty, 10) || 0 };
        receiveForm.setData('receipts', next);
    };

    if (!order) return null;

    const hasRemaining = order.items?.some((i) => i.quantity_remaining > 0);

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.modules.purchase.index', project.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <IconShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">{order.order_number}</h2>
                            <p className="mt-0.5 text-sm text-gray-500">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>
                                    {order.status}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {order.can_update && order.status === 'draft' && (
                            <Link href={route('projects.modules.purchase.edit', [project.id, order.id])}>
                                <SecondaryButton>
                                    <IconPencil className="h-4 w-4" />
                                    Edit
                                </SecondaryButton>
                            </Link>
                        )}
                        {order.can_receive && hasRemaining && order.status !== 'cancelled' && (
                            <PrimaryButton onClick={() => setShowReceiveModal(true)}>
                                <IconPackage className="h-4 w-4" />
                                Receive
                            </PrimaryButton>
                        )}
                        {order.can_update && (
                            <SecondaryButton onClick={() => { setShowBillModal(true); billForm.setData({ bill_reference: order.bill_reference || '', bill_amount: order.bill_amount?.toString() || '' }); }}>
                                <IconDocument className="h-4 w-4" />
                                Supplier Bill
                            </SecondaryButton>
                        )}
                        {order.can_update && order.status === 'draft' && (
                            <PrimaryButton
                                onClick={() => router.post(route('projects.modules.purchase.send', [project.id, order.id]), {})}
                            >
                                Send
                            </PrimaryButton>
                        )}
                        {order.can_update && (order.status === 'draft' || order.status === 'sent') && !hasRemaining && (
                            <button
                                type="button"
                                onClick={() => router.post(route('projects.modules.purchase.cancel', [project.id, order.id]), {})}
                                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - ${order.order_number}`} />

            <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-4">Supplier</h3>
                    {order.supplier ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <Link
                                    href={route('projects.modules.suppliers.show', [project.id, order.supplier.id])}
                                    className="font-medium hover:underline"
                                    style={{ color: primaryColor }}
                                >
                                    {order.supplier.name}
                                </Link>
                                {(order.supplier.phone || order.supplier.email) && (
                                    <div className="text-sm text-gray-500 mt-1">
                                        {order.supplier.phone && <span>{order.supplier.phone}</span>}
                                        {order.supplier.phone && order.supplier.email && ' · '}
                                        {order.supplier.email && <span>{order.supplier.email}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No supplier assigned</p>
                    )}
                    {order.ordered_at && (
                        <p className="mt-2 text-sm text-gray-600">Ordered: {order.ordered_at}</p>
                    )}
                    {order.notes && (
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
                    )}
                </div>

                {(order.bill_reference || order.bill_amount) && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <IconDocument className="h-5 w-5 text-gray-500" />
                            Supplier Bill
                        </h3>
                        <dl className="grid gap-2 sm:grid-cols-2">
                            {order.bill_reference && (
                                <>
                                    <dt className="text-sm text-gray-500">Reference</dt>
                                    <dd className="font-medium">{order.bill_reference}</dd>
                                </>
                            )}
                            {order.bill_amount != null && (
                                <>
                                    <dt className="text-sm text-gray-500">Amount</dt>
                                    <dd className="font-medium"><IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(order.bill_amount).toLocaleString()}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                )}

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Items</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ordered</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Received</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Remaining</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Cost</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {order.items?.map((i) => (
                                <tr key={i.id}>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{i.product.name}</span>
                                        <span className="text-gray-500 text-sm ml-1">({i.product.unit})</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">{i.quantity_ordered}</td>
                                    <td className="px-6 py-4 text-right">{i.quantity_received}</td>
                                    <td className="px-6 py-4 text-right">{i.quantity_remaining}</td>
                                    <td className="px-6 py-4 text-right">{Number(i.unit_cost).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-medium">{Number(i.line_total).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-6">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="font-medium">{Number(order.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="px-6 py-2 bg-gray-50 flex justify-end gap-6">
                        <span className="text-sm text-gray-600">Tax</span>
                        <span className="font-medium">{Number(order.tax).toLocaleString()}</span>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-6">
                        <span className="font-medium text-gray-900">Total</span>
                        <span className="font-bold text-lg"><IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(order.total).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {showReceiveModal && (
                <Modal show onClose={() => setShowReceiveModal(false)} maxWidth="lg">
                    <form onSubmit={handleReceive} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Receive Items</h3>
                        <p className="mt-1 text-sm text-gray-600">Enter quantities received for each item.</p>
                        {locations?.length > 0 && (
                            <div className="mt-4">
                                <InputLabel value="Location (optional)" />
                                <select
                                    value={receiveForm.data.location_id}
                                    onChange={(e) => receiveForm.setData('location_id', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">—</option>
                                    {locations?.map((l) => (
                                        <option key={l.id} value={l.id}>{l.name} {l.code ? `(${l.code})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="mt-4 space-y-3">
                            {receiveForm.data.receipts?.map((r, idx) => {
                                const item = order.items?.find((i) => i.id === r.item_id);
                                if (!item || item.quantity_remaining <= 0) return null;
                                return (
                                    <div key={r.item_id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                                        <span className="flex-1 font-medium">{item.product.name}</span>
                                        <span className="text-sm text-gray-500">Max: {item.quantity_remaining}</span>
                                        <div className="w-24">
                                            <TextInput
                                                type="number"
                                                min="0"
                                                max={item.quantity_remaining}
                                                value={r.quantity}
                                                onChange={(e) => updateReceiptQty(idx, e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <InputError message={receiveForm.errors.receipts} />
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowReceiveModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={receiveForm.processing}>Record Receipt</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {showBillModal && (
                <Modal show onClose={() => setShowBillModal(false)} maxWidth="sm">
                    <form onSubmit={handleBillUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Supplier Bill</h3>
                        <p className="mt-1 text-sm text-gray-600">Optional reference to link this PO to a supplier invoice.</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Bill Reference" />
                                <TextInput
                                    value={billForm.data.bill_reference}
                                    onChange={(e) => billForm.setData('bill_reference', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. INV-2024-001"
                                />
                            </div>
                            <div>
                                <InputLabel value="Bill Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={billForm.data.bill_amount}
                                    onChange={(e) => billForm.setData('bill_amount', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowBillModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={billForm.processing}>Save</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
