import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconArrowLeft,
    IconCreditCard,
    IconDollar,
    IconPlus,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const paymentStatusColors = {
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-600',
    refunded: 'bg-gray-100 text-gray-600',
};

export default function SalesShow({ project, sale, can }) {
    const [showPayModal, setShowPayModal] = useState(false);

    const payForm = useForm({
        payment_method: 'cash',
        amount: sale?.remaining?.toString() || '',
        reference: '',
        payment_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const handlePay = (e) => {
        e.preventDefault();
        payForm.post(route('projects.modules.sales.pay', [project.id, sale.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowPayModal(false);
                payForm.setData('amount', sale?.remaining?.toString() || '');
            },
        });
    };

    const openPayModal = () => {
        setShowPayModal(true);
        payForm.setData('amount', sale?.remaining?.toString() || '');
    };

    const selectClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
    const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

    if (!sale) return null;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.modules.sales.index', project.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <IconArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">{sale.sale_number}</h2>
                            <p className="mt-0.5 text-sm text-gray-500">
                                {new Date(sale.created_at).toLocaleDateString()} · {sale.user?.name || '—'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${paymentStatusColors[sale.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                            {sale.payment_status}
                        </span>
                        {can?.pay && sale.remaining > 0 && sale.payment_status !== 'cancelled' && sale.payment_status !== 'refunded' && (
                            <PrimaryButton onClick={openPayModal}>
                                <IconCreditCard className="h-4 w-4" />
                                Record Payment
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - ${sale.sale_number}`} />

            <div className="space-y-6">
                {/* Items */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Items</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sale.items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-600">{item.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-600">{Number(item.unit_price).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{Number(item.total).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals & Payments */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-gray-900">Summary</h3>
                        <dl className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-600">Subtotal</dt>
                                <dd>{Number(sale.subtotal).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-600">Discount</dt>
                                <dd>-{Number(sale.discount).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-600">Tax</dt>
                                <dd>{Number(sale.tax).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                                <dt>Total</dt>
                                <dd><IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(sale.total).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between text-sm text-emerald-600">
                                <dt>Paid</dt>
                                <dd>{Number(sale.total_paid).toLocaleString()}</dd>
                            </div>
                            {sale.remaining > 0 && (
                                <div className="flex justify-between text-sm font-medium text-amber-600">
                                    <dt>Remaining</dt>
                                    <dd>{Number(sale.remaining).toLocaleString()}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-gray-900">Payments</h3>
                        {sale.payments?.length > 0 ? (
                            <ul className="mt-4 space-y-3">
                                {sale.payments.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                                        <div>
                                            <span className="font-medium capitalize">{p.payment_method}</span>
                                            <span className="ml-2 text-sm text-gray-500">{p.payment_date}</span>
                                            {p.reference && <span className="ml-2 text-xs text-gray-400">({p.reference})</span>}
                                        </div>
                                        <span className="font-medium text-emerald-600">{Number(p.amount).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-sm text-gray-500">No payments recorded.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <Modal show onClose={() => setShowPayModal(false)} maxWidth="md">
                    <form onSubmit={handlePay} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Record Payment</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Remaining due: {Number(sale.remaining).toLocaleString()}
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={sale.remaining}
                                    value={payForm.data.amount}
                                    onChange={(e) => payForm.setData('amount', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Max: {Number(sale.remaining).toLocaleString()}</p>
                                <InputError message={payForm.errors.amount} />
                            </div>
                            <div>
                                <InputLabel value="Payment Method" />
                                <select
                                    value={payForm.data.payment_method}
                                    onChange={(e) => payForm.setData('payment_method', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="check">Check</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Payment Date" />
                                <TextInput
                                    type="date"
                                    value={payForm.data.payment_date}
                                    onChange={(e) => payForm.setData('payment_date', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Reference (optional)" />
                                <TextInput
                                    value={payForm.data.reference}
                                    onChange={(e) => payForm.setData('reference', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Notes (optional)" />
                                <textarea
                                    value={payForm.data.notes}
                                    onChange={(e) => payForm.setData('notes', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowPayModal(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={payForm.processing}>
                                Record Payment
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
