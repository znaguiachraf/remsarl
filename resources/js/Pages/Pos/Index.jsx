import ProjectLayout from '@/Layouts/ProjectLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

export default function PosIndex({ project, session, products, categories = [], can }) {
    const { currentProject, flash, payment_methods = [] } = usePage().props;
    const primaryColor = currentProject?.primary_color || '#3B82F6';
    const secondaryColor = currentProject?.secondary_color || '#10B981';

    const [cart, setCart] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [discount, setDiscount] = useState('0');
    const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [closingCash, setClosingCash] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [payments, setPayments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const posContainerRef = useRef(null);

    const filteredProducts = useMemo(() => {
        let list = products || [];
        const q = (productSearch || '').toLowerCase().trim();
        if (q) {
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.id.toString().includes(q)
            );
        }
        if (categoryFilter) {
            const catId = parseInt(categoryFilter, 10);
            list = list.filter((p) => p.category_id === catId);
        }
        return list;
    }, [products, productSearch, categoryFilter]);

    const enterFullscreen = useCallback(() => {
        posContainerRef.current?.requestFullscreen?.().then(() => {
            setIsFullscreen(true);
        }).catch(() => {});
    }, []);

    const exitFullscreen = useCallback(() => {
        document.exitFullscreen?.().then(() => {
            setIsFullscreen(false);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const addToCart = useCallback(
        (product) => {
            const existing = cart.find((c) => c.product_id === product.id);
            if (existing) {
                setCart(
                    cart.map((c) =>
                        c.product_id === product.id
                            ? { ...c, quantity: c.quantity + 1 }
                            : c
                    )
                );
            } else {
                setCart([
                    ...cart,
                    {
                        product_id: product.id,
                        name: product.name,
                        quantity: 1,
                        unit_price: product.price,
                    },
                ]);
            }
        },
        [cart]
    );

    const updateCartItem = useCallback((idx, field, value) => {
        setCart((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            if (field === 'quantity' && parseInt(value, 10) <= 0) {
                return prev.filter((_, i) => i !== idx);
            }
            return next;
        });
    }, []);

    const removeFromCart = useCallback((idx) => {
        setCart((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setPayments([]);
        setShowPaymentModal(false);
        setPaymentAmount('');
    }, []);

    const subtotal = cart.reduce(
        (sum, c) => sum + c.quantity * (c.unit_price || 0),
        0
    );
    const discountInput = parseFloat(discount) || 0;
    const discountVal = discountType === 'percent'
        ? Math.min(subtotal, (subtotal * discountInput) / 100)
        : Math.min(subtotal, discountInput);
    const total = Math.max(0, subtotal - discountVal);
    const paymentsTotal = payments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
    );
    const remaining = total - paymentsTotal;

    const addPayment = () => {
        const amt = parseFloat(paymentAmount) || 0;
        if (amt <= 0) return;
        if (amt > remaining) {
            setErrors({ payment: 'Amount exceeds remaining due.' });
            return;
        }
        setPayments((prev) => [
            ...prev,
            { payment_method: paymentMethod, amount: amt.toString() },
        ]);
        setPaymentAmount('');
        setShowPaymentModal(false);
        setErrors({});
    };

    const removePayment = (idx) => {
        setPayments((prev) => prev.filter((_, i) => i !== idx));
    };

    const doCompleteSale = () => {
        setErrors({});

        const validItems = cart
            .filter((c) => c.quantity > 0)
            .map((c) => ({
                product_id: c.product_id,
                quantity: parseInt(c.quantity, 10),
                unit_price: parseFloat(c.unit_price) || 0,
            }));

        if (validItems.length === 0) {
            setErrors({ items: 'Add at least one product to the cart.' });
            return;
        }

        const validPayments = payments
            .filter((p) => parseFloat(p.amount) > 0)
            .map((p) => ({
                payment_method: p.payment_method,
                amount: parseFloat(p.amount),
                reference: null,
            }));

        setSubmitting(true);
        router.post(route('projects.modules.pos.orders.store', project.id), {
            items: validItems,
            discount: discountVal,
            payments: validPayments,
        }, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                clearCart();
                setDiscount('0');
                setDiscountType('fixed');
            },
            onError: (errs) => setErrors(errs),
        });
    };

    const handleCompleteSale = (e) => {
        e?.preventDefault?.();
        doCompleteSale();
    };

    const handleOpenSession = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('projects.modules.pos.session.open', project.id), {}, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onError: (errs) => setErrors(errs),
        });
    };

    const handleCloseSession = (e) => {
        e.preventDefault();
        const cash = parseFloat(closingCash);
        if (isNaN(cash) || cash < 0) {
            setErrors({ closing_cash: 'Enter a valid closing cash amount.' });
            return;
        }
        setSubmitting(true);
        router.post(
            route('projects.modules.pos.session.close', [project.id, session.id]),
            { closing_cash: cash },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onSuccess: () => {
                    setShowCloseSessionModal(false);
                    setClosingCash('');
                },
                onError: (errs) => setErrors(errs),
            }
        );
    };

    return (
        <ProjectLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.show', project.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Point of Sale</h2>
                            <p className="text-sm text-gray-500">{project.name}</p>
                        </div>
                    </div>

                    {/* Fullscreen & Session */}
                    <div className="flex items-center gap-3">
                        {session && (
                            <>
                                <button
                                    type="button"
                                    onClick={enterFullscreen}
                                    title="Fullscreen"
                                    className="rounded-lg border p-2 transition hover:opacity-90"
                                    style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10`, color: primaryColor }}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </button>
                            </>
                        )}
                        {session ? (
                            <>
                                <div
                                    className="flex items-center gap-2 rounded-lg border px-4 py-2"
                                    style={{
                                        borderColor: session.status === 'open' ? primaryColor : '#9CA3AF',
                                        backgroundColor: session.status === 'open' ? `${primaryColor}15` : '#F3F4F6',
                                    }}
                                >
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                            backgroundColor: session.status === 'open' ? primaryColor : '#9CA3AF',
                                        }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Session {session.session_number} • {session.status === 'open' ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                {can.close_session && session.status === 'open' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCloseSessionModal(true)}
                                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                                    >
                                        Close Session
                                    </button>
                                )}
                            </>
                        ) : (
                            can.open_session && (
                                <button
                                    type="button"
                                    onClick={handleOpenSession}
                                    disabled={submitting}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Open Session
                                </button>
                            )
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`POS - ${project.name}`} />

            {flash?.success && (
                <div
                    className="mb-4 rounded-lg p-4 text-sm font-medium"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                    {flash.success}
                </div>
            )}

            {!session ? (
                <div
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center"
                    style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}08` }}
                >
                    <svg
                        className="mx-auto h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: `${primaryColor}60` }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No open session</h3>
                    <p className="mt-2 max-w-sm text-gray-600">
                        Open a session to start making sales. You can only have one open session at a time.
                    </p>
                    {can.open_session && (
                        <button
                            type="button"
                            onClick={handleOpenSession}
                            disabled={submitting}
                            className="mt-6 rounded-lg px-6 py-3 text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Open Session
                        </button>
                    )}
                </div>
            ) : (
                <div
                    ref={posContainerRef}
                    className="flex min-h-0 flex-col rounded-xl bg-white p-4 md:min-h-[calc(100vh-12rem)] md:p-6 lg:min-h-[calc(100vh-10rem)] [&:fullscreen]:p-6"
                    style={{
                        ['--project-primary']: primaryColor,
                        ['--project-secondary']: secondaryColor,
                    }}
                >
                    {/* Exit fullscreen button - visible only when in fullscreen */}
                    {isFullscreen && (
                        <div className="mb-4 flex justify-end">
                            <button
                                type="button"
                                onClick={exitFullscreen}
                                title="Exit fullscreen"
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                style={{ backgroundColor: secondaryColor }}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Exit fullscreen
                            </button>
                        </div>
                    )}
                    <div className="grid flex-1 gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
                        {/* Product search, filter & grid */}
                        <div className="flex min-h-0 flex-col md:col-span-2">
                            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <TextInput
                                    type="search"
                                    placeholder="Search products by name or ID..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full sm:flex-1"
                                    autoFocus
                                />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="rounded-md border-gray-300 text-sm focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)] sm:w-40"
                                >
                                    <option value="">All categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
                            {filteredProducts.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => addToCart(p)}
                                    className="flex flex-col rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-[var(--project-primary)] hover:shadow md:p-4"
                                >
                                    <span className="truncate text-sm font-medium text-gray-900 md:text-base">{p.name}</span>
                                    <span className="mt-1 text-sm font-semibold" style={{ color: primaryColor }}>
                                        {(p.price || 0).toFixed(2)}
                                    </span>
                                    {p.stock !== undefined && (
                                        <span className="mt-0.5 text-xs text-gray-500">Stock: {p.stock}</span>
                                    )}
                                </button>
                            ))}
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="flex min-h-0 flex-col rounded-xl border bg-white shadow-sm md:min-h-[400px]" style={{ borderColor: `${primaryColor}30` }}>
                        <div className="shrink-0 border-b px-4 py-3" style={{ borderColor: `${primaryColor}20` }}>
                            <h3 className="font-semibold" style={{ color: primaryColor }}>Cart</h3>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:max-h-72">
                            {cart.length === 0 ? (
                                <p className="text-center text-sm text-gray-500">Cart is empty</p>
                            ) : (
                                <ul className="space-y-2">
                                    {cart.map((item, idx) => (
                                        <li
                                            key={`${item.product_id}-${idx}`}
                                            className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 p-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">{item.name}</span>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateCartItem(idx, 'quantity', e.target.value)
                                                        }
                                                        className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                                                    />
                                                    <span className="text-xs text-gray-500">
                                                        × {(item.unit_price || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-semibold">
                                                    {(
                                                        item.quantity * (item.unit_price || 0)
                                                    ).toFixed(2)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(idx)}
                                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="border-t border-gray-200 p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <InputLabel className="text-xs shrink-0">Discount</InputLabel>
                                    <div className="flex items-center gap-1">
                                        <select
                                            value={discountType}
                                            onChange={(e) => {
                                                setDiscountType(e.target.value);
                                                setDiscount('0');
                                            }}
                                            className="rounded border border-gray-300 text-sm focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]"
                                        >
                                            <option value="fixed">Fixed</option>
                                            <option value="percent">%</option>
                                        </select>
                                        <TextInput
                                            type="number"
                                            min="0"
                                            step={discountType === 'percent' ? '1' : '0.01'}
                                            max={discountType === 'percent' ? '100' : undefined}
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            className="w-20"
                                            placeholder={discountType === 'percent' ? '%' : '0.00'}
                                        />
                                        {discountType === 'percent' && <span className="text-xs text-gray-500">%</span>}
                                    </div>
                                    {discountVal > 0 && (
                                        <span className="text-xs text-gray-500">
                                            ({discountVal.toFixed(2)} off)
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between border-t pt-2 font-semibold" style={{ borderColor: `${primaryColor}30` }}>
                                    <span style={{ color: primaryColor }}>Total</span>
                                    <span style={{ color: primaryColor }}>{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {payments.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    <p className="text-xs font-medium text-gray-600">Payments</p>
                                    {payments.map((p, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-sm"
                                        >
                                            <span className="capitalize">{p.payment_method}</span>
                                            <div className="flex items-center gap-2">
                                                <span>{(parseFloat(p.amount) || 0).toFixed(2)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removePayment(i)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Paid</span>
                                        <span>{paymentsTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Remaining</span>
                                        <span>{remaining.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            {remaining > 0 && cart.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="mt-3 w-full rounded-lg border py-2 text-sm font-medium transition hover:opacity-90"
                                    style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}10` }}
                                >
                                    Add Payment
                                </button>
                            )}

                            <InputError message={errors.items || errors.payments} className="mt-2" />

                            <button
                                type="button"
                                onClick={handleCompleteSale}
                                disabled={
                                    submitting ||
                                    cart.length === 0 ||
                                    remaining > 0 ||
                                    !can.create_order
                                }
                                className="mt-4 w-full rounded-lg py-3 text-lg font-semibold text-white disabled:opacity-50"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Complete Sale
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )}

            {/* Close session modal */}
            <Modal show={showCloseSessionModal} onClose={() => setShowCloseSessionModal(false)}>
                <form onSubmit={handleCloseSession} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Close Session</h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Enter the closing cash count for session {session?.session_number}.
                    </p>
                    <div className="mt-4">
                        <InputLabel htmlFor="closing_cash">Closing Cash</InputLabel>
                        <TextInput
                            id="closing_cash"
                            type="number"
                            min="0"
                            step="0.01"
                            value={closingCash}
                            onChange={(e) => setClosingCash(e.target.value)}
                            className="mt-1 w-full"
                            required
                        />
                        <InputError message={errors.closing_cash} className="mt-1" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCloseSessionModal(false)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Close Session
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add payment modal */}
            <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
                <form onSubmit={(e) => { e.preventDefault(); addPayment(); }} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
                    <p className="mt-1 text-sm text-gray-600">Remaining due: {remaining.toFixed(2)}</p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="payment_method">Method</InputLabel>
                            <select
                                id="payment_method"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]"
                            >
                                {payment_methods.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="payment_amount">Amount</InputLabel>
                            <TextInput
                                id="payment_amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder={remaining.toFixed(2)}
                                className="mt-1 w-full"
                                required
                            />
                            <InputError message={errors.payment} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        {remaining > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    handleCompleteSale();
                                }}
                                className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                            >
                                Complete as Unpaid
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowPaymentModal(false)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Add Payment
                        </button>
                    </div>
                </form>
            </Modal>
        </ProjectLayout>
    );
}
