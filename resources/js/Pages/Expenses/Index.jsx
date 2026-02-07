import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/project/StatusBadge';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconCalendar,
    IconDollar,
    IconFolder,
    IconPencil,
    IconCreditCard,
    IconTag,
    IconPlus,
    IconArrowLeft,
    IconDocument,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ExpensesIndex({ project, expenses, categories, suppliers, filters, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [payingExpense, setPayingExpense] = useState(null);

    const createForm = useForm({
        expense_category_id: '',
        supplier_id: '',
        reference: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
    });

    const editForm = useForm({
        expense_category_id: '',
        supplier_id: '',
        reference: '',
        description: '',
        amount: '',
        expense_date: '',
        status: 'pending',
    });

    const payForm = useForm({
        payment_method: 'cash',
        amount: '',
        reference: '',
        payment_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('projects.modules.expenses.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        editForm.setData({
            expense_category_id: expense.expense_category?.id?.toString() || '',
            supplier_id: expense.supplier?.id?.toString() || '',
            reference: expense.reference || '',
            description: expense.description,
            amount: expense.amount.toString(),
            expense_date: expense.expense_date,
            status: expense.status || 'pending',
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingExpense) return;
        editForm.patch(route('projects.modules.expenses.update', [project.id, editingExpense.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingExpense(null);
            },
        });
    };

    const openPayModal = (expense) => {
        setPayingExpense(expense);
        payForm.setData({
            payment_method: 'cash',
            amount: expense.amount.toString(),
            reference: '',
            payment_date: new Date().toISOString().slice(0, 10),
            notes: '',
        });
    };

    const handlePay = (e) => {
        e.preventDefault();
        if (!payingExpense) return;
        payForm.post(route('projects.modules.expenses.pay', [project.id, payingExpense.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setPayingExpense(null);
            },
        });
    };

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.expenses.index', project.id), newFilters, {
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
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <IconDollar className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Expenses</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Manage project expenses and payments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('projects.modules.expenses.categories.index', project.id)}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <IconFolder />
                            Categories
                        </Link>
                        {can?.create && (
                            <PrimaryButton onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2">
                                <IconPlus />
                                Add Expense
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Expenses`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <IconTag className="text-gray-500" />
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                        className={selectClass + ' max-w-[140px]'}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
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
                <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-4">
                    <IconCalendar className="text-gray-500" />
                    <select
                        value={filters?.month ? 'month' : (filters?.from_date || filters?.to_date) ? 'range' : ''}
                        onChange={(e) => {
                            const mode = e.target.value;
                            const newFilters = { ...filters };
                            delete newFilters.from_date;
                            delete newFilters.to_date;
                            delete newFilters.month;
                            if (mode === 'month') newFilters.month = new Date().toISOString().slice(0, 7);
                            else if (mode === 'range') {
                                const d = new Date();
                                newFilters.from_date = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
                                newFilters.to_date = new Date().toISOString().slice(0, 10);
                            }
                            applyFilters(newFilters);
                        }}
                        className={selectClass + ' max-w-[130px]'}
                    >
                        <option value="">All dates</option>
                        <option value="month">By month</option>
                        <option value="range">Date range</option>
                    </select>
                </div>
                {(filters?.month) && (
                    <input
                        type="month"
                        value={filters?.month || new Date().toISOString().slice(0, 7)}
                        onChange={(e) => applyFilters({ ...filters, month: e.target.value })}
                        className={inputClass + ' max-w-[150px]'}
                    />
                )}
                {((filters?.from_date) || (filters?.to_date)) && (
                    <>
                        <input
                            type="date"
                            value={filters?.from_date || ''}
                            onChange={(e) => applyFilters({ ...filters, from_date: e.target.value })}
                            className={inputClass + ' max-w-[140px]'}
                        />
                        <span className="text-gray-400">–</span>
                        <input
                            type="date"
                            value={filters?.to_date || ''}
                            onChange={(e) => applyFilters({ ...filters, to_date: e.target.value })}
                            className={inputClass + ' max-w-[140px]'}
                        />
                    </>
                )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <span className="inline-flex items-center gap-1.5"><IconCalendar className="h-4 w-4" />Date</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <span className="inline-flex items-center gap-1.5"><IconDocument className="h-4 w-4" />Description</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <span className="inline-flex items-center gap-1.5"><IconFolder className="h-4 w-4" />Category</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Supplier</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                <span className="inline-flex items-center gap-1.5 justify-end"><IconDollar className="h-4 w-4" />Amount</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {expenses?.data?.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {expense.expense_date}
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{expense.description}</div>
                                        {expense.reference && (
                                            <div className="text-xs text-gray-500">Ref: {expense.reference}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {expense.expense_category ? (
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{
                                                backgroundColor: expense.expense_category.color ? `${expense.expense_category.color}20` : '#f3f4f6',
                                                color: expense.expense_category.color || '#374151',
                                            }}
                                        >
                                            {expense.expense_category.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {expense.supplier ? (
                                        <Link
                                            href={route('projects.modules.suppliers.show', [project.id, expense.supplier.id])}
                                            className="font-medium hover:underline"
                                            style={{ color: primaryColor }}
                                        >
                                            {expense.supplier.name}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                    {Number(expense.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={expense.status} size="sm" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {expense.can_update && (
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(expense)}
                                                className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80"
                                                style={{ color: primaryColor }}
                                            >
                                                <IconPencil className="h-4 w-4" />Edit
                                            </button>
                                        )}
                                        {expense.can_pay && expense.status === 'pending' && (
                                            <>
                                                {expense.can_update && <span className="text-gray-300">|</span>}
                                                <button
                                                    type="button"
                                                    onClick={() => openPayModal(expense)}
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                                >
                                                    <IconCreditCard className="h-4 w-4" />Pay
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!expenses?.data || expenses.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconDollar className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No expenses yet.</p>
                        <p className="mt-1 text-sm">{can?.create ? 'Add your first expense to get started.' : ''}</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {expenses?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {expenses.data.length} of {expenses.meta.total} expenses
                    </p>
                    <div className="flex gap-2">
                        {expenses.links?.map((link, i) => (
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

            {/* Create Modal */}
            {showCreateModal && (
                <Modal show onClose={() => setShowCreateModal(false)} maxWidth="lg">
                    <form onSubmit={handleCreate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Expense</h3>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Description" />
                                <TextInput
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={createForm.errors.description} />
                            </div>
                            <div>
                                <InputLabel value="Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={createForm.data.amount}
                                    onChange={(e) => createForm.setData('amount', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={createForm.errors.amount} />
                            </div>
                            <div>
                                <InputLabel value="Date" />
                                <TextInput
                                    type="date"
                                    value={createForm.data.expense_date}
                                    onChange={(e) => createForm.setData('expense_date', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={createForm.errors.expense_date} />
                            </div>
                            <div>
                                <InputLabel value="Category" />
                                <select
                                    value={createForm.data.expense_category_id}
                                    onChange={(e) => createForm.setData('expense_category_id', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">—</option>
                                    {categories?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Supplier" />
                                <select
                                    value={createForm.data.supplier_id}
                                    onChange={(e) => createForm.setData('supplier_id', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">—</option>
                                    {suppliers?.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Reference" />
                                <TextInput
                                    value={createForm.data.reference}
                                    onChange={(e) => createForm.setData('reference', e.target.value)}
                                    className={inputClass}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={createForm.processing}>
                                Create
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Modal */}
            {editingExpense && (
                <Modal show onClose={() => setEditingExpense(null)} maxWidth="lg">
                    <form onSubmit={handleUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Expense</h3>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Description" />
                                <TextInput
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={editForm.errors.description} />
                            </div>
                            <div>
                                <InputLabel value="Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editForm.data.amount}
                                    onChange={(e) => editForm.setData('amount', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={editForm.errors.amount} />
                            </div>
                            <div>
                                <InputLabel value="Date" />
                                <TextInput
                                    type="date"
                                    value={editForm.data.expense_date}
                                    onChange={(e) => editForm.setData('expense_date', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={editForm.errors.expense_date} />
                            </div>
                            <div>
                                <InputLabel value="Category" />
                                <select
                                    value={editForm.data.expense_category_id}
                                    onChange={(e) => editForm.setData('expense_category_id', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">—</option>
                                    {categories?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Supplier" />
                                <select
                                    value={editForm.data.supplier_id}
                                    onChange={(e) => editForm.setData('supplier_id', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">—</option>
                                    {suppliers?.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Reference" />
                                <TextInput
                                    value={editForm.data.reference}
                                    onChange={(e) => editForm.setData('reference', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <InputLabel value="Status" />
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                                <InputError message={editForm.errors.status} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setEditingExpense(null)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>
                                Update
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Pay Modal */}
            {payingExpense && (
                <Modal show onClose={() => setPayingExpense(null)} maxWidth="md">
                    <form onSubmit={handlePay} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Record Payment</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Mark expense &quot;{payingExpense.description}&quot; as paid.
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Payment method" />
                                <select
                                    value={payForm.data.payment_method}
                                    onChange={(e) => payForm.setData('payment_method', e.target.value)}
                                    className={selectClass}
                                    required
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="check">Check</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={payForm.data.amount}
                                    onChange={(e) => payForm.setData('amount', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={payForm.errors.amount} />
                            </div>
                            <div>
                                <InputLabel value="Payment date" />
                                <TextInput
                                    type="date"
                                    value={payForm.data.payment_date}
                                    onChange={(e) => payForm.setData('payment_date', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={payForm.errors.payment_date} />
                            </div>
                            <div>
                                <InputLabel value="Reference" />
                                <TextInput
                                    value={payForm.data.reference}
                                    onChange={(e) => payForm.setData('reference', e.target.value)}
                                    className={inputClass}
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea
                                    value={payForm.data.notes}
                                    onChange={(e) => payForm.setData('notes', e.target.value)}
                                    className={inputClass}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setPayingExpense(null)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={payForm.processing}>
                                Mark as Paid
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
