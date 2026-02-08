import ProjectLayout from '@/Layouts/ProjectLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { IconPlus, IconTrash } from '@/Components/expense/Icons';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PurchaseEdit({ project, order, suppliers, products }) {
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [items, setItems] = useState(order?.items?.map((i) => ({
        product_id: i.product_id.toString(),
        quantity_ordered: i.quantity_ordered,
        unit_cost: i.unit_cost.toString(),
    })) ?? [{ product_id: '', quantity_ordered: 1, unit_cost: '' }]);

    const form = useForm({
        supplier_id: order?.supplier_id?.toString() || '',
        ordered_at: order?.ordered_at || new Date().toISOString().slice(0, 10),
        notes: order?.notes || '',
        items: [],
    });

    const addItem = () => {
        setItems([...items, { product_id: '', quantity_ordered: 1, unit_cost: '' }]);
    };

    const removeItem = (idx) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx, field, value) => {
        const next = [...items];
        next[idx] = { ...next[idx], [field]: value };
        if (field === 'product_id') {
            const p = products?.find((pr) => pr.id === parseInt(value, 10));
            if (p) next[idx].unit_cost = p.cost_price?.toString() ?? '';
        }
        setItems(next);
    };

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        const validItems = items
            .filter((i) => i.product_id && i.quantity_ordered > 0)
            .map((i) => ({
                product_id: parseInt(i.product_id, 10),
                quantity_ordered: parseInt(i.quantity_ordered, 10),
                unit_cost: parseFloat(i.unit_cost) || 0,
            }));
        if (validItems.length === 0) {
            form.setError('items', 'Add at least one item.');
            return;
        }
        form.setData({ ...form.data, items: validItems });
        form.patch(route('projects.modules.purchase.update', [project.id, order.id]), {
            preserveScroll: true,
        });
    };

    if (!order) return null;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.modules.purchase.show', [project.id, order.id])}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Edit {order.order_number}</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Update purchase order</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Edit ${order.order_number}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-4">Order Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel value="Supplier" />
                            <select
                                value={form.data.supplier_id}
                                onChange={(e) => form.setData('supplier_id', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">—</option>
                                {suppliers?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Order Date" />
                            <TextInput
                                type="date"
                                value={form.data.ordered_at}
                                onChange={(e) => form.setData('ordered_at', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel value="Notes" />
                            <textarea
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                className={inputClass}
                                rows={2}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Items</h3>
                        <button type="button" onClick={addItem} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80" style={{ color: usePage().props.currentProject?.primary_color || '#3B82F6' }}>
                            <IconPlus className="h-4 w-4" />
                            Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                                <div className="flex-1 min-w-[180px]">
                                    <InputLabel value="Product" />
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                                        className={selectClass}
                                        required
                                    >
                                        <option value="">Select product</option>
                                        {products?.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <InputLabel value="Qty" />
                                    <TextInput
                                        type="number"
                                        min="1"
                                        value={item.quantity_ordered}
                                        onChange={(e) => updateItem(idx, 'quantity_ordered', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="w-28">
                                    <InputLabel value="Unit Cost" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.unit_cost}
                                        onChange={(e) => updateItem(idx, 'unit_cost', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(idx)}
                                    className="p-2 text-gray-400 hover:text-red-600"
                                    title="Remove"
                                >
                                    <IconTrash className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <InputError message={form.errors.items} />
                </div>

                <div className="flex justify-end gap-2">
                    <Link href={route('projects.modules.purchase.show', [project.id, order.id])}>
                        <SecondaryButton type="button">Cancel</SecondaryButton>
                    </Link>
                    <PrimaryButton type="submit" disabled={form.processing}>
                        Update Purchase Order
                    </PrimaryButton>
                </div>
            </form>
        </ProjectLayout>
    );
}
