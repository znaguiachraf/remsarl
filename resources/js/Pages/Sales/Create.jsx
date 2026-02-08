import ProjectLayout from '@/Layouts/ProjectLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconArrowLeft,
    IconDollar,
    IconPlus,
    IconTrash,
} from '@/Components/expense/Icons';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function SalesCreate({ project, products }) {
    const { currentProject, payment_methods = [] } = usePage().props;
    const primaryColor = currentProject?.primary_color || '#3B82F6';

    const [lineItems, setLineItems] = useState([{ product_id: '', quantity: 1, unit_price: '' }]);
    const [payments, setPayments] = useState([]);
    const [productSearch, setProductSearch] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState({ discount: '0' });

    const addLine = () => {
        setLineItems([...lineItems, { product_id: '', quantity: 1, unit_price: '' }]);
    };

    const removeLine = (idx) => {
        setLineItems(lineItems.filter((_, i) => i !== idx));
    };

    const updateLine = (idx, field, value) => {
        const next = [...lineItems];
        next[idx] = { ...next[idx], [field]: value };
        if (field === 'product_id') {
            const p = products?.find((x) => x.id.toString() === value);
            if (p) next[idx].unit_price = p.price.toString();
            setProductSearch((prev) => ({ ...prev, [idx]: '' }));
            setOpenDropdown(null);
        }
        setLineItems(next);
    };

    const filteredProducts = (idx) => {
        const search = (productSearch[idx] || '').toLowerCase();
        if (!search) return products || [];
        return (products || []).filter(
            (p) =>
                p.name.toLowerCase().includes(search) ||
                p.id.toString().includes(search)
        );
    };

    const addPayment = () => {
        setPayments([...payments, { payment_method: payment_methods[0]?.value || 'cash', amount: '', reference: '', payment_date: new Date().toISOString().slice(0, 10) }]);
    };

    const removePayment = (idx) => {
        setPayments(payments.filter((_, i) => i !== idx));
    };

    const updatePayment = (idx, field, value) => {
        const next = [...payments];
        next[idx] = { ...next[idx], [field]: value };
        setPayments(next);
    };

    const subtotal = lineItems.reduce((sum, line) => {
        const p = products?.find((x) => x.id.toString() === line.product_id);
        const price = line.unit_price ? parseFloat(line.unit_price) : (p?.price ?? 0);
        return sum + (line.quantity || 0) * price;
    }, 0);
    const discount = parseFloat(formData.discount) || 0;
    const total = subtotal - discount;
    const paymentsTotal = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const validItems = lineItems
            .filter((l) => l.product_id && l.quantity > 0)
            .map((l) => ({
                product_id: parseInt(l.product_id, 10),
                quantity: parseInt(l.quantity, 10),
                unit_price: parseFloat(l.unit_price) || 0,
            }));

        if (validItems.length === 0) {
            setErrors({ items: 'Add at least one product.' });
            return;
        }

        const validPayments = payments
            .filter((p) => p.amount && parseFloat(p.amount) > 0)
            .map((p) => ({
                payment_method: p.payment_method,
                amount: parseFloat(p.amount),
                reference: p.reference || null,
                payment_date: p.payment_date || new Date().toISOString().slice(0, 10),
            }));

        if (validPayments.length > 0 && validPayments.reduce((s, p) => s + p.amount, 0) > total) {
            setErrors({ payments: 'Total payments cannot exceed sale total.' });
            return;
        }

        setErrors({});
        setSubmitting(true);
        router.post(route('projects.modules.sales.store', project.id), {
            items: validItems,
            discount: discount.toString(),
            payments: validPayments,
        }, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onError: (errs) => setErrors(errs),
        });
    };

    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

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
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">New Sale</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Create invoice or order</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - New Sale`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-medium text-gray-900">Line Items</h3>
                    <div className="mt-4 space-y-4">
                        {lineItems.map((line, idx) => (
                            <div key={idx} className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                                <div className="relative min-w-[200px] flex-1" ref={openDropdown === idx ? dropdownRef : null}>
                                    <InputLabel value="Product" />
                                    <div className="relative">
                                        <TextInput
                                            type="text"
                                            placeholder="Search product..."
                                            value={line.product_id ? (products?.find((p) => p.id.toString() === line.product_id)?.name || '') : (productSearch[idx] || '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (line.product_id) {
                                                    updateLine(idx, 'product_id', '');
                                                }
                                                setProductSearch((prev) => ({ ...prev, [idx]: val }));
                                                setOpenDropdown(idx);
                                            }}
                                            onFocus={() => setOpenDropdown(idx)}
                                            className="block w-full"
                                            required={idx === 0 && !line.product_id}
                                            autoComplete="off"
                                        />
                                        {openDropdown === idx && (
                                            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                                                {filteredProducts(idx).length === 0 ? (
                                                    <li className="px-4 py-2 text-sm text-gray-500">No products found</li>
                                                ) : (
                                                    filteredProducts(idx).map((p) => (
                                                        <li
                                                            key={p.id}
                                                            className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                                                            onClick={() => updateLine(idx, 'product_id', p.id.toString())}
                                                        >
                                                            {p.name} — {Number(p.price).toLocaleString()} ({p.stock} in stock)
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className="w-24">
                                    <InputLabel value="Qty" />
                                    <TextInput
                                        type="number"
                                        min="1"
                                        value={line.quantity}
                                        onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <div className="w-32">
                                    <InputLabel value="Unit Price" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={line.unit_price}
                                        onChange={(e) => updateLine(idx, 'unit_price', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <div className="w-28 text-right font-medium text-gray-700">
                                    {((line.quantity || 0) * (parseFloat(line.unit_price) || 0)).toLocaleString()}
                                </div>
                                {lineItems.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLine(idx)}
                                        className="rounded p-2 text-red-600 hover:bg-red-50"
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addLine}
                            className="flex items-center gap-2 text-sm font-medium transition hover:opacity-80"
                            style={{ color: primaryColor }}
                        >
                            <IconPlus className="h-4 w-4" /> Add line
                        </button>
                    </div>
                    <InputError message={errors.items} />
                </div>

                <div
                    className="rounded-xl border p-6 shadow-sm"
                    style={{
                        borderColor: `${primaryColor}40`,
                        backgroundColor: `${primaryColor}08`,
                    }}
                >
                    <h3 className="text-base font-medium text-gray-900">Totals</h3>
                    <div className="mt-4 grid max-w-xs gap-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <InputLabel value="Discount" />
                            <TextInput
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.discount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                                className="block w-24"
                            />
                        </div>
                        <div
                            className="flex justify-between border-t pt-2 font-medium"
                            style={{ borderColor: `${primaryColor}40` }}
                        >
                            <span style={{ color: primaryColor }}>Total</span>
                            <span className="text-lg" style={{ color: primaryColor }}>
                                <IconDollar className="inline h-4 w-4" /> {total.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-medium text-gray-900">Payments (optional — leave empty for unpaid)</h3>
                    <div className="mt-4 space-y-4">
                        {payments.map((p, idx) => (
                            <div key={idx} className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                                <div className="w-32">
                                    <InputLabel value="Method" />
                                    <select
                                        value={p.payment_method}
                                        onChange={(e) => updatePayment(idx, 'payment_method', e.target.value)}
                                        className={selectClass}
                                    >
                                        {payment_methods.map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <InputLabel value="Amount" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={p.amount}
                                        onChange={(e) => updatePayment(idx, 'amount', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <div className="w-36">
                                    <InputLabel value="Date" />
                                    <TextInput
                                        type="date"
                                        value={p.payment_date}
                                        onChange={(e) => updatePayment(idx, 'payment_date', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <div className="w-40">
                                    <InputLabel value="Reference" />
                                    <TextInput
                                        value={p.reference}
                                        onChange={(e) => updatePayment(idx, 'reference', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePayment(idx)}
                                    className="rounded p-2 text-red-600 hover:bg-red-50"
                                >
                                    <IconTrash className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPayment}
                            className="flex items-center gap-2 text-sm font-medium transition hover:opacity-80"
                            style={{ color: primaryColor }}
                        >
                            <IconPlus className="h-4 w-4" /> Add payment
                        </button>
                        {payments.length > 0 && (
                            <p className="text-sm text-gray-500">
                                Payments total: {paymentsTotal.toLocaleString()} / {total.toLocaleString()}
                            </p>
                        )}
                    </div>
                    <InputError message={errors.payments} />
                </div>

                <div className="flex justify-end gap-2">
                    <Link href={route('projects.modules.sales.index', project.id)}>
                        <SecondaryButton type="button">Cancel</SecondaryButton>
                    </Link>
                    <PrimaryButton type="submit" disabled={submitting}>
                        Create Sale
                    </PrimaryButton>
                </div>
            </form>
        </ProjectLayout>
    );
}
