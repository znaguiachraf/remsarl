import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import {
    IconArrowLeft,
    IconCalendar,
    IconPlus,
    IconUsers,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ATTENDANCE_STATUS_COLORS = {
    present: 'bg-emerald-100 text-emerald-800',
    absent: 'bg-red-100 text-red-800',
    half_day: 'bg-amber-100 text-amber-800',
    leave: 'bg-blue-100 text-blue-800',
    late: 'bg-orange-100 text-orange-800',
    excused: 'bg-gray-100 text-gray-800',
};

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const isDateInVacation = (dateStr, vacations) => {
    if (!vacations?.length) return false;
    const d = new Date(dateStr);
    return vacations.some((v) => {
        const start = new Date(v.start_date);
        const end = new Date(v.end_date);
        return d >= start && d <= end;
    });
};

export default function HrAttendanceIndex({ project, workers, attendances_by_worker, vacations_by_worker = {}, month, year, days_in_month, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);

    const attendanceForm = useForm({
        worker_id: '',
        dates: [],
        status: 'present',
        notes: '',
    });

    const openAddModal = (workerId, dateOrDates) => {
        const dates = Array.isArray(dateOrDates) ? dateOrDates : [dateOrDates];
        setSelectedWorker(workerId);
        setSelectedDates(dates);
        attendanceForm.setData({
            worker_id: workerId,
            dates: dates,
            status: 'present',
            notes: '',
        });
        setShowAddModal(true);
    };

    const toggleDateInModal = (dateStr) => {
        const current = attendanceForm.data.dates || [];
        const next = current.includes(dateStr)
            ? current.filter((d) => d !== dateStr)
            : [...current, dateStr].sort();
        attendanceForm.setData('dates', next);
        setSelectedDates(next);
    };

    const handleAddAttendance = (e) => {
        e.preventDefault();
        const workerId = attendanceForm.data.worker_id;
        const dates = attendanceForm.data.dates || [];
        if (dates.length === 0) return;
        attendanceForm.transform((data) => ({
            dates: data.dates,
            status: data.status,
            notes: data.notes,
        }));
        attendanceForm.post(route('projects.modules.hr.workers.attendances.storeBulk', [project.id, workerId]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                setSelectedWorker(null);
                setSelectedDates([]);
            },
        });
    };

    const days = Array.from({ length: days_in_month }, (_, i) => i + 1);

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
                            <IconCalendar className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Attendance Overview</h2>
                            <p className="mt-0.5 text-sm text-gray-500">
                                {MONTHS[month - 1]} {year} · {workers.length} workers
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('projects.modules.hr.workers.index', project.id)}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <IconUsers className="h-4 w-4" />
                            Workers
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Attendance`} />

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-1">
                    <Link
                        href={`${route('projects.modules.hr.attendance.index', project.id)}?month=${month === 1 ? 12 : month - 1}&year=${month === 1 ? year - 1 : year}`}
                        className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <span className="min-w-[120px] text-center font-medium text-gray-900">{MONTHS[month - 1]} {year}</span>
                    <Link
                        href={`${route('projects.modules.hr.attendance.index', project.id)}?month=${month === 12 ? 1 : month + 1}&year=${month === 12 ? year + 1 : year}`}
                        className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                {workers.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                        No workers in this project. Add workers to track attendance.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Worker</th>
                                {days.map((day) => (
                                    <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 w-12">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {workers.map((worker) => (
                                <tr key={worker.id} className="hover:bg-gray-50/50">
                                    <td className="sticky left-0 z-10 bg-white px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap border-r border-gray-100">
                                        <Link
                                            href={route('projects.modules.hr.workers.show', [project.id, worker.id])}
                                            className="hover:underline"
                                            style={{ color: primaryColor }}
                                        >
                                            {worker.full_name}
                                        </Link>
                                    </td>
                                    {days.map((day) => {
                                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const record = attendances_by_worker[worker.id]?.[dateStr];
                                        const isVacation = isDateInVacation(dateStr, vacations_by_worker[worker.id] || []);
                                        const display = record || (isVacation ? { status: 'leave', status_label: 'Vacation' } : null);
                                        return (
                                            <td key={day} className="px-1 py-1 text-center w-12">
                                                {display ? (
                                                    <span
                                                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${ATTENDANCE_STATUS_COLORS[display.status] || 'bg-gray-100 text-gray-800'}`}
                                                        title={display.status_label}
                                                    >
                                                        {display.status === 'present' ? '✓' : display.status === 'absent' ? '✗' : display.status === 'half_day' ? '½' : display.status === 'leave' ? 'V' : display.status?.charAt(0) || '—'}
                                                    </span>
                                                ) : can?.create ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openAddModal(worker.id, dateStr)}
                                                        className="w-full min-h-[24px] rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-[10px]"
                                                        title="Add attendance (click to select more days)"
                                                    >
                                                        +
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
                Legend: ✓ Present · ✗ Absent · ½ Half day · V Vacation · L Leave · T Late · E Excused. Approved vacations are shown automatically.
            </p>

            {showAddModal && (
                <Modal show onClose={() => setShowAddModal(false)} maxWidth="md">
                    <form onSubmit={handleAddAttendance} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Attendance</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {workers.find((w) => w.id === parseInt(attendanceForm.data.worker_id, 10))?.full_name} · Select one or more days
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Select days" />
                                <div className="mt-2 grid grid-cols-7 gap-1">
                                    {days.map((day) => {
                                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const checked = (attendanceForm.data.dates || []).includes(dateStr);
                                        const record = attendances_by_worker[attendanceForm.data.worker_id]?.[dateStr];
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
                                                    onChange={() => toggleDateInModal(dateStr)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">{day}</span>
                                                {record && <span className="text-[10px] text-gray-500">{record.status_label}</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {(attendanceForm.data.dates || []).length} day(s) selected. Click days to add/remove.
                                </p>
                            </div>
                            <div>
                                <InputLabel value="Status" />
                                <select
                                    value={attendanceForm.data.status}
                                    onChange={(e) => attendanceForm.setData('status', e.target.value)}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`}
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
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowAddModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={attendanceForm.processing || (attendanceForm.data.dates || []).length === 0}>
                                Save ({(attendanceForm.data.dates || []).length} days)
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
