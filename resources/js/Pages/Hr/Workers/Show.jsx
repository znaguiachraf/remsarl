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
    IconDocument,
    IconDollar,
    IconPencil,
    IconPlus,
    IconTag,
    IconTrash,
    IconUsers,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const ATTENDANCE_STATUS_COLORS = {
    present: 'bg-emerald-100 text-emerald-800',
    absent: 'bg-red-100 text-red-800',
    half_day: 'bg-amber-100 text-amber-800',
    leave: 'bg-blue-100 text-blue-800',
    late: 'bg-orange-100 text-orange-800',
    excused: 'bg-gray-100 text-gray-800',
};

const TABS = [
    { key: 'contract', label: 'Contract', icon: IconTag },
    { key: 'salary', label: 'Salary', icon: IconDollar },
    { key: 'attendance', label: 'Attendance', icon: IconCalendar },
    { key: 'vacations', label: 'Vacations', icon: IconCalendar },
    { key: 'cnss', label: 'CNSS', icon: IconCreditCard },
    { key: 'notes', label: 'Notes', icon: IconDocument },
];

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const isDateInVacation = (dateStr, vacations) => {
    if (!vacations?.length) return false;
    const d = new Date(dateStr);
    return vacations.some((v) => {
        if (v.status !== 'approved') return false;
        const start = new Date(v.start_date);
        const end = new Date(v.end_date);
        return d >= start && d <= end;
    });
};

export default function HrWorkersShow({ project, worker, can }) {
    const { flash, payment_methods = [] } = usePage().props;
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [activeTab, setActiveTab] = useState('contract');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [showVacationModal, setShowVacationModal] = useState(false);
    const [showCnssModal, setShowCnssModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(null);
    const [showEditSalaryModal, setShowEditSalaryModal] = useState(null);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth() + 1);
    const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
    const [attendances, setAttendances] = useState([]);
    const [attendancesLoading, setAttendancesLoading] = useState(false);

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

    const editSalaryForm = useForm({
        gross_amount: '',
        net_amount: '',
        absent_days: '',
        attendance_deduction: '',
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

    const attendanceForm = useForm({
        date: '',
        dates: [],
        status: 'present',
        notes: '',
    });

    const fetchAttendances = () => {
        if (!worker?.id) return;
        setAttendancesLoading(true);
        window.axios.get(route('projects.modules.hr.workers.attendances.index', [project.id, worker.id]), {
            params: { month: attendanceMonth, year: attendanceYear },
        }).then((res) => {
            setAttendances(res.data.attendances || []);
        }).catch(() => setAttendances([])).finally(() => setAttendancesLoading(false));
    };

    useEffect(() => {
        if (activeTab === 'attendance' && worker?.id) {
            fetchAttendances();
        }
    }, [activeTab, worker?.id, attendanceMonth, attendanceYear]);

    const openAttendanceModal = (dayOrAttendance) => {
        if (typeof dayOrAttendance === 'object' && dayOrAttendance?.id) {
            setEditingAttendance(dayOrAttendance);
            attendanceForm.setData({
                date: dayOrAttendance.date,
                dates: [],
                status: dayOrAttendance.status,
                notes: dayOrAttendance.notes || '',
            });
        } else {
            const day = dayOrAttendance || 1;
            const dateStr = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            setEditingAttendance(null);
            attendanceForm.setData({
                date: dateStr,
                dates: [dateStr],
                status: 'present',
                notes: '',
            });
        }
        setShowAttendanceModal(true);
    };

    const toggleAttendanceDateInModal = (dateStr) => {
        const current = attendanceForm.data.dates || [];
        const next = current.includes(dateStr)
            ? current.filter((d) => d !== dateStr)
            : [...current, dateStr].sort();
        attendanceForm.setData('dates', next);
    };

    const closeAttendanceModal = () => {
        setShowAttendanceModal(false);
        setEditingAttendance(null);
    };

    const handleSaveAttendance = (e) => {
        e.preventDefault();
        const dates = attendanceForm.data.dates || [];
        if (editingAttendance) {
            attendanceForm.transform((data) => ({ date: data.date, status: data.status, notes: data.notes }));
            attendanceForm.post(route('projects.modules.hr.workers.attendances.store', [project.id, worker.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    closeAttendanceModal();
                    fetchAttendances();
                },
            });
        } else if (dates.length > 0) {
            attendanceForm.transform((data) => ({ dates: data.dates, status: data.status, notes: data.notes }));
            attendanceForm.post(route('projects.modules.hr.workers.attendances.storeBulk', [project.id, worker.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    closeAttendanceModal();
                    fetchAttendances();
                },
            });
        }
    };

    const handleDeleteAttendance = (attendance) => {
        if (!attendance.can_delete) return;
        router.delete(route('projects.modules.hr.workers.attendances.destroy', [project.id, attendance.id]), {
            preserveScroll: true,
            onSuccess: () => fetchAttendances(),
        });
    };

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

    const openEditSalaryModal = (salary) => {
        setShowEditSalaryModal(salary);
        editSalaryForm.setData({
            gross_amount: salary.gross_amount.toString(),
            net_amount: salary.net_amount.toString(),
            absent_days: (salary.absent_days ?? 0).toString(),
            attendance_deduction: (salary.attendance_deduction ?? 0).toString(),
        });
    };

    const handleEditSalary = (e) => {
        e.preventDefault();
        if (!showEditSalaryModal) return;
        editSalaryForm.patch(route('projects.modules.hr.workers.salaries.update', [project.id, showEditSalaryModal.id]), {
            preserveScroll: true,
            onSuccess: () => setShowEditSalaryModal(null),
        });
    };

    const handleDeleteSalary = (salary) => {
        if (!salary.can_delete) return;
        if (salary.status === 'paid') return;
        if (!confirm(`Delete salary for ${MONTHS[salary.month - 1]} ${salary.year}?`)) return;
        router.delete(route('projects.modules.hr.workers.salaries.destroy', { project: project.id, salary: salary.id }), {
            preserveScroll: true,
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

            {flash?.error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}
            {flash?.success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {flash.success}
                </div>
            )}

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
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Working days</th>
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
                                        <td className="px-6 py-4 text-sm text-right text-gray-600">{s.working_days ?? '—'}</td>
                                        <td className="px-6 py-4 text-sm text-right">{Number(s.gross_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">
                                            {Number(s.net_amount).toLocaleString()}
                                            {(s.absent_days > 0 || s.attendance_deduction > 0) && (
                                                <span className="block text-xs font-normal text-amber-600" title="Absent days deduction">
                                                    −{s.absent_days}d ({Number(s.attendance_deduction).toLocaleString()})
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                s.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                                s.status === 'generated' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {s.status_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
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
                                                {s.can_update && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditSalaryModal(s)}
                                                        className="text-sm text-gray-600 hover:text-gray-900"
                                                    >
                                                        <IconPencil className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {s.can_delete && s.status !== 'paid' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSalary(s)}
                                                        className="text-sm text-red-600 hover:text-red-700"
                                                        title="Delete salary (only unpaid)"
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
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
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">Attendance</h3>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (attendanceMonth === 1) {
                                            setAttendanceMonth(12);
                                            setAttendanceYear((y) => y - 1);
                                        } else {
                                            setAttendanceMonth((m) => m - 1);
                                        }
                                    }}
                                    className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <span className="min-w-[120px] text-center font-medium text-gray-900">{MONTHS[attendanceMonth - 1]} {attendanceYear}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (attendanceMonth === 12) {
                                            setAttendanceMonth(1);
                                            setAttendanceYear((y) => y + 1);
                                        } else {
                                            setAttendanceMonth((m) => m + 1);
                                        }
                                    }}
                                    className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                        {can?.create_attendance && (
                            <PrimaryButton onClick={() => openAttendanceModal(1)}>
                                <IconPlus className="h-4 w-4" />
                                Add Attendance
                            </PrimaryButton>
                        )}
                    </div>
                    <div className="p-6">
                        {attendancesLoading ? (
                            <p className="text-center py-8 text-gray-500">Loading...</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-7 gap-2 sm:grid-cols-10 md:grid-cols-15" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))' }}>
                                    {Array.from({ length: new Date(attendanceYear, attendanceMonth, 0).getDate() }, (_, i) => i + 1).map((day) => {
                                        const dateStr = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const record = attendances.find((a) => a.date === dateStr);
                                        const isVacation = isDateInVacation(dateStr, worker.vacations);
                                        const displayStatus = record || (isVacation ? { status: 'leave', status_label: 'Vacation' } : null);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => can?.create_attendance && openAttendanceModal(record || day)}
                                                className={`min-h-[2.5rem] rounded-lg border p-1.5 text-center text-xs font-medium transition ${
                                                    displayStatus
                                                        ? `${ATTENDANCE_STATUS_COLORS[displayStatus.status] || 'bg-gray-100'} cursor-pointer hover:ring-2`
                                                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-gray-100'
                                                }`}
                                                title={displayStatus ? `${displayStatus.status_label}${record?.notes ? `: ${record.notes}` : ''}` : 'Add'}
                                            >
                                                <span className="block">{day}</span>
                                                {displayStatus && <span className="block truncate text-[10px]">{displayStatus.status_label}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {(attendances.length > 0 || (worker.vacations?.filter((v) => v.status === 'approved').length || 0) > 0) && (
                                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                        {['present', 'absent', 'half_day', 'leave', 'late', 'excused'].map((status) => {
                                            const count = attendances.filter((a) => a.status === status).length;
                                            const vacationCount = status === 'leave' ? Array.from({ length: new Date(attendanceYear, attendanceMonth, 0).getDate() }, (_, i) => i + 1)
                                                .filter((d) => {
                                                    const dateStr = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                                    return isDateInVacation(dateStr, worker.vacations) && !attendances.find((a) => a.date === dateStr);
                                                }).length : 0;
                                            const total = count + vacationCount;
                                            if (total === 0) return null;
                                            const label = attendances.find((x) => x.status === status)?.status_label || (status === 'leave' ? 'Vacation/Leave' : status);
                                            const dotClass = ATTENDANCE_STATUS_COLORS[status]?.split(' ')[0] || 'bg-gray-300';
                                            return (
                                                <span key={status} className="flex items-center gap-1.5">
                                                    <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
                                                    {label}: {total}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
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
                    {/* Vacation balance: allocated, used, remaining (for worker and manager) */}
                    {worker.vacation_balance && (
                        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated ({worker.vacation_balance.year})</p>
                                <p className="mt-1 text-xl font-semibold text-gray-900">{worker.vacation_balance.allocated ?? 0} days</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Used</p>
                                <p className="mt-1 text-xl font-semibold text-amber-600">{worker.vacation_balance.used ?? 0} days</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</p>
                                <p className="mt-1 text-xl font-semibold text-emerald-600">{worker.vacation_balance.remaining ?? 0} days</p>
                            </div>
                            {worker.vacation_days_per_year != null && can?.update && (
                                <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center">
                                    <p className="text-xs text-gray-500">Annual allocation is editable in worker profile.</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="px-6 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">Vacation history & requests</p>
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

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Employee Notes</h3>
                        <Link
                            href={route('projects.notes.index', project.id) + '?worker_id=' + worker.id}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            style={{ borderColor: primaryColor + '60', color: primaryColor }}
                        >
                            View all notes
                        </Link>
                    </div>
                    {worker.employee_notes?.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {worker.employee_notes.map((note) => (
                                <div key={note.id} className="px-6 py-4">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {note.direction === 'to_employee' ? 'To employee' : 'From employee'} · {note.author_name} · {new Date(note.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No notes yet. Notes to and from this employee will appear here.
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
                            <p className="text-sm text-gray-500">
                                Salary is calculated from working days (Mon–Fri) in the month. Net = Gross − (absent days × daily rate).
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowSalaryModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={salaryForm.processing}>Generate</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Salary Modal */}
            {showEditSalaryModal && (
                <Modal show onClose={() => setShowEditSalaryModal(null)} maxWidth="sm">
                    <form onSubmit={handleEditSalary} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Salary</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {MONTHS[showEditSalaryModal.month - 1]} {showEditSalaryModal.year} · {showEditSalaryModal.working_days} working days
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Gross Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editSalaryForm.data.gross_amount}
                                    onChange={(e) => editSalaryForm.setData('gross_amount', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Net Amount" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editSalaryForm.data.net_amount}
                                    onChange={(e) => editSalaryForm.setData('net_amount', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Absent Days" />
                                <TextInput
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={editSalaryForm.data.absent_days}
                                    onChange={(e) => editSalaryForm.setData('absent_days', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Attendance Deduction" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editSalaryForm.data.attendance_deduction}
                                    onChange={(e) => editSalaryForm.setData('attendance_deduction', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowEditSalaryModal(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editSalaryForm.processing}>Save</PrimaryButton>
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
                                    {payment_methods.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
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

            {/* Add/Edit Attendance Modal */}
            {showAttendanceModal && (
                <Modal show onClose={closeAttendanceModal} maxWidth={editingAttendance ? 'sm' : 'md'}>
                    <form onSubmit={handleSaveAttendance} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            {editingAttendance ? 'Edit Attendance' : 'Add Attendance'}
                        </h3>
                        <div className="mt-4 space-y-4">
                            {editingAttendance ? (
                                <div>
                                    <InputLabel value="Date" />
                                    <TextInput
                                        type="date"
                                        value={attendanceForm.data.date}
                                        onChange={(e) => attendanceForm.setData('date', e.target.value)}
                                        className="block w-full"
                                        required
                                    />
                                </div>
                            ) : (
                                <div>
                                    <InputLabel value="Select days" />
                                    <div className="mt-2 grid grid-cols-7 gap-1">
                                        {Array.from({ length: new Date(attendanceYear, attendanceMonth, 0).getDate() }, (_, i) => i + 1).map((day) => {
                                            const dateStr = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const checked = (attendanceForm.data.dates || []).includes(dateStr);
                                            const record = attendances.find((a) => a.date === dateStr);
                                            return (
                                                <label
                                                    key={day}
                                                    className={`flex cursor-pointer flex-col items-center rounded border p-2 text-center text-xs transition ${
                                                        checked ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                                                    } ${record ? 'opacity-60' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleAttendanceDateInModal(dateStr)}
                                                        className="sr-only"
                                                    />
                                                    <span className="font-medium">{day}</span>
                                                    {record && <span className="text-[10px] text-gray-500 truncate">{record.status_label}</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {(attendanceForm.data.dates || []).length} day(s) selected.
                                    </p>
                                </div>
                            )}
                            <div>
                                <InputLabel value="Status" />
                                <select
                                    value={attendanceForm.data.status}
                                    onChange={(e) => attendanceForm.setData('status', e.target.value)}
                                    className={selectClass + ' w-full'}
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="half_day">Half day</option>
                                    <option value="leave">Leave</option>
                                    <option value="late">Late</option>
                                    <option value="excused">Excused</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Notes" />
                                <textarea
                                    value={attendanceForm.data.notes}
                                    onChange={(e) => attendanceForm.setData('notes', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' w-full'}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <div>
                                {editingAttendance?.can_delete && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Remove this attendance record?')) {
                                                handleDeleteAttendance(editingAttendance);
                                                closeAttendanceModal();
                                            }
                                        }}
                                        className="text-sm text-red-600 hover:text-red-500"
                                    >
                                        <IconTrash className="inline h-4 w-4 mr-1" />
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <SecondaryButton type="button" onClick={closeAttendanceModal}>Cancel</SecondaryButton>
                                <PrimaryButton
                                    type="submit"
                                    disabled={attendanceForm.processing || (!editingAttendance && (attendanceForm.data.dates || []).length === 0)}
                                >
                                    Save{!editingAttendance && (attendanceForm.data.dates || []).length > 0 ? ` (${(attendanceForm.data.dates || []).length} days)` : ''}
                                </PrimaryButton>
                            </div>
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
