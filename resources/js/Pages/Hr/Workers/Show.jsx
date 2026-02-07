import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconArrowLeft,
    IconCalendar,
    IconCreditCard,
    IconDollar,
    IconPencil,
    IconPlus,
    IconTag,
    IconTrash,
    IconUsers,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const TABS = [
    { key: 'contract', label: 'Contract', icon: IconTag },
    { key: 'salary', label: 'Salary', icon: IconDollar },
    { key: 'attendance', label: 'Attendance', icon: IconCalendar },
    { key: 'vacations', label: 'Vacations', icon: IconCalendar },
    { key: 'cnss', label: 'CNSS', icon: IconCreditCard },
];

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function HrWorkersShow({ project, worker, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [activeTab, setActiveTab] = useState('contract');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [showVacationModal, setShowVacationModal] = useState(false);
    const [showCnssModal, setShowCnssModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(null);

    const now = new Date();
    const salaryForm = useForm({
        month: String(now.getMonth() + 1),
        year: String(now.getFullYear()),
    });

    const payForm = useForm({
        payment_method: 'transfer',
        amount: '',
        reference: '',
        payment_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const contractForm = useForm({
        type: 'cdi',
        status: 'draft',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        salary_amount: '',
        salary_currency: 'MAD',
        notes: '',
    });

    const vacationForm = useForm({
        start_date: '',
        end_date: '',
        notes: '',
    });

    const cnssForm = useForm({
        registration_number: '',
        registration_date: '',
        status: 'active',
        notes: '',
    });

    const handleGenerateSalary = (e) => {
        e.preventDefault();
        salaryForm.post(route('projects.modules.hr.workers.salaries.generate', [project.id, worker.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSalaryModal(false);
                salaryForm.reset();
            },
        });
    };

    const openPayModal = (salary) => {
        setShowPayModal(salary);
        payForm.setData({
            payment_method: 'transfer',
            amount: salary.net_amount.toString(),
            reference: '',
            payment_date: new Date().toISOString().slice(0, 10),
            notes: '',
        });
    };

    const handlePaySalary = (e) => {
        e.preventDefault();
        if (!showPayModal) return;
        payForm.post(route('projects.modules.hr.workers.salaries.pay', [project.id, showPayModal.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowPayModal(null);
            },
        });
    };

    const handleAddContract = (e) => {
        e.preventDefault();
        contractForm.post(route('projects.modules.hr.workers.contracts.store', [project.id, worker.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowContractModal(false);
                contractForm.reset();
            },
        });
    };

    const handleAddVacation = (e) => {
        e.preventDefault();
        vacationForm.post(route('projects.modules.hr.workers.vacations.store', [project.id, worker.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowVacationModal(false);
                vacationForm.reset();
            },
        });
    };

    const handleAddCnss = (e) => {
        e.preventDefault();
        cnssForm.post(route('projects.modules.hr.workers.cnss.store', [project.id, worker.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowCnssModal(false);
                cnssForm.reset();
            },
        });
    };

    const handleApproveVacation = (vacation) => {
        router.post(route('projects.modules.hr.vacations.approve', [project.id, vacation.id]), {}, { preserveScroll: true });
    };

    const handleRejectVacation = (vacation) => {
        router.post(route('projects.modules.hr.vacations.reject', [project.id, vacation.id]), { rejection_reason: '' }, { preserveScroll: true });
    };

    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    if (!worker) return null;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.modules.hr.workers.index', project.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <IconArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <IconUsers className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">{worker.full_name}</h2>
                            <p className="mt-0.5 text-sm text-gray-500">
                                {worker.employee_number && `#${worker.employee_number} · `}
                                {worker.cnss_number && `CNSS ${worker.cnss_number} · `}
                                {worker.email || worker.phone || 'No contact'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can?.update && (
                            <Link
                                href={route('projects.modules.hr.workers.index', project.id)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <IconPencil className="h-4 w-4" />
                                Edit
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - ${worker.full_name}`} />

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium ${
                                activeTab === key
                                    ? 'border-[var(--project-primary)] text-[var(--project-primary)]'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab: Contract */}
            {activeTab === 'contract' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Contracts</h3>
                        {can?.create_contract && (
                            <PrimaryButton onClick={() => setShowContractModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Add Contract
                            </PrimaryButton>
                        )}
                    </div>
                    {worker.contracts?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {worker.contracts.map((c) => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.type_label}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                c.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                                c.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {c.status_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{c.start_date} – {c.end_date || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">{Number(c.salary_amount).toLocaleString()} {c.salary_currency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No contracts yet. Add a contract to enable salary generation.
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Salary */}
            {activeTab === 'salary' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Salaries</h3>
                        {can?.create_salary && (
                            <PrimaryButton onClick={() => setShowSalaryModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Generate Salary
                            </PrimaryButton>
                        )}
                    </div>
                    {worker.salaries?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Gross</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Net</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {worker.salaries.map((s) => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{MONTHS[s.month - 1]} {s.year}</td>
                                        <td className="px-6 py-4 text-sm text-right">{Number(s.gross_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">{Number(s.net_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                s.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                                s.status === 'generated' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {s.status_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {s.status === 'generated' && (
                                                <button
                                                    type="button"
                                                    onClick={() => openPayModal(s)}
                                                    className="text-sm font-medium"
                                                    style={{ color: primaryColor }}
                                                >
                                                    Record Payment
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No salaries generated yet. Ensure the worker has an active contract, then generate a salary.
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Attendance */}
            {activeTab === 'attendance' && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-medium text-gray-900">Attendance</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Attendance tracking (working days) will be available. Use the calendar view to record daily attendance.
                    </p>
                    <p className="mt-4 text-sm text-gray-400 italic">Full calendar view coming soon.</p>
                </div>
            )}

            {/* Tab: Vacations */}
            {activeTab === 'vacations' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Vacations (Congés)</h3>
                        {can?.create_vacation && (
                            <PrimaryButton onClick={() => setShowVacationModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Request Vacation
                            </PrimaryButton>
                        )}
                    </div>
                    {worker.vacations?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {worker.vacations.map((v) => (
                                    <tr key={v.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{v.start_date} – {v.end_date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{v.days_count} days</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                v.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {v.status_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {v.status === 'pending' && v.can_approve && (
                                                <span className="flex gap-2 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveVacation(v)}
                                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectVacation(v)}
                                                        className="text-sm font-medium text-red-600 hover:text-red-500"
                                                    >
                                                        Reject
                                                    </button>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No vacation requests yet.
                        </div>
                    )}
                </div>
            )}

            {/* Tab: CNSS */}
            {activeTab === 'cnss' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">CNSS Records</h3>
                        {can?.create_cnss && (
                            <PrimaryButton onClick={() => setShowCnssModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Add CNSS Record
                            </PrimaryButton>
                        )}
                    </div>
                    {worker.cnss_records?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Registration #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {worker.cnss_records.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.registration_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{r.registration_date || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No CNSS records yet.
                        </div>
                    )}
                </div>
            )}

            {/* Salary Generation Modal */}
            {showSalaryModal && (
                <Modal show onClose={() => setShowSalaryModal(false)} maxWidth="sm">
                    <form onSubmit={handleGenerateSalary} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Generate Salary</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Month" />
                                <select
                                    value={salaryForm.data.month}
                                    onChange={(e) => salaryForm.setData('month', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Year" />
                                <TextInput
                                    type="number"
                                    min="2020"
                                    max="2100"
                                    value={salaryForm.data.year}
                                    onChange={(e) => salaryForm.setData('year', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                            </div>
                            <p className="text-sm text-gray-500">Salary will be generated based on the active contract.</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowSalaryModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={salaryForm.processing}>Generate</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Pay Salary Modal */}
            {showPayModal && (
                <Modal show onClose={() => setShowPayModal(null)} maxWidth="md">
                    <form onSubmit={handlePaySalary} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Record Salary Payment</h3>
                        <p className="mt-1 text-sm text-gray-500">Net amount: {Number(showPayModal.net_amount).toLocaleString()}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={payForm.data.amount}
                                    onChange={(e) => payForm.setData('amount', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Payment Method" />
                                <select value={payForm.data.payment_method} onChange={(e) => payForm.setData('payment_method', e.target.value)} className={selectClass + ' w-full'}>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="check">Check</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Payment Date" />
                                <TextInput type="date" value={payForm.data.payment_date} onChange={(e) => payForm.setData('payment_date', e.target.value)} className="block w-full" required />
                            </div>
                            <div>
                                <InputLabel value="Reference" />
                                <TextInput value={payForm.data.reference} onChange={(e) => payForm.setData('reference', e.target.value)} className="block w-full" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowPayModal(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={payForm.processing}>Record Payment</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Contract Modal */}
            {showContractModal && (
                <Modal show onClose={() => setShowContractModal(false)} maxWidth="md">
                    <form onSubmit={handleAddContract} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Contract</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Type" />
                                <select value={contractForm.data.type} onChange={(e) => contractForm.setData('type', e.target.value)} className={selectClass + ' w-full'}>
                                    <option value="cdi">CDI (Indefinite)</option>
                                    <option value="cdd">CDD (Fixed-term)</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Status" />
                                <select value={contractForm.data.status} onChange={(e) => contractForm.setData('status', e.target.value)} className={selectClass + ' w-full'}>
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="terminated">Terminated</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Start Date" />
                                    <TextInput type="date" value={contractForm.data.start_date} onChange={(e) => contractForm.setData('start_date', e.target.value)} className="block w-full" required />
                                </div>
                                <div>
                                    <InputLabel value="End Date (CDD)" />
                                    <TextInput type="date" value={contractForm.data.end_date} onChange={(e) => contractForm.setData('end_date', e.target.value)} className="block w-full" />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Salary Amount" />
                                <TextInput type="number" step="0.01" min="0" value={contractForm.data.salary_amount} onChange={(e) => contractForm.setData('salary_amount', e.target.value)} className="block w-full" required />
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea value={contractForm.data.notes} onChange={(e) => contractForm.setData('notes', e.target.value)} rows={2} className={inputClass + ' w-full'} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowContractModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={contractForm.processing}>Add Contract</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Vacation Modal */}
            {showVacationModal && (
                <Modal show onClose={() => setShowVacationModal(false)} maxWidth="sm">
                    <form onSubmit={handleAddVacation} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Request Vacation</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Start Date" />
                                <TextInput type="date" value={vacationForm.data.start_date} onChange={(e) => vacationForm.setData('start_date', e.target.value)} className="block w-full" required />
                            </div>
                            <div>
                                <InputLabel value="End Date" />
                                <TextInput type="date" value={vacationForm.data.end_date} onChange={(e) => vacationForm.setData('end_date', e.target.value)} className="block w-full" required />
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea value={vacationForm.data.notes} onChange={(e) => vacationForm.setData('notes', e.target.value)} rows={2} className={inputClass + ' w-full'} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowVacationModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={vacationForm.processing}>Submit Request</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add CNSS Modal */}
            {showCnssModal && (
                <Modal show onClose={() => setShowCnssModal(false)} maxWidth="sm">
                    <form onSubmit={handleAddCnss} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add CNSS Record</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Registration Number" />
                                <TextInput value={cnssForm.data.registration_number} onChange={(e) => cnssForm.setData('registration_number', e.target.value)} className="block w-full" required />
                            </div>
                            <div>
                                <InputLabel value="Registration Date" />
                                <TextInput type="date" value={cnssForm.data.registration_date} onChange={(e) => cnssForm.setData('registration_date', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="Status" />
                                <select value={cnssForm.data.status} onChange={(e) => cnssForm.setData('status', e.target.value)} className={selectClass + ' w-full'}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea value={cnssForm.data.notes} onChange={(e) => cnssForm.setData('notes', e.target.value)} rows={2} className={inputClass + ' w-full'} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowCnssModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={cnssForm.processing}>Add</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
