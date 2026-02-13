import ProjectLayout from '@/Layouts/ProjectLayout';
import {
    IconCalendar,
    IconArrowLeft,
    IconUsers,
} from '@/Components/expense/Icons';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
};

function buildMonthDays(year, month) {
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const total = startPad + daysInMonth;
    const rows = Math.ceil(total / 7);
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const remaining = rows * 7 - cells.length;
    for (let i = 0; i < remaining; i++) cells.push(null);
    return { cells, daysInMonth };
}

function getEventsForDay(calendarEvents, year, month, day) {
    if (!day) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (calendarEvents || []).filter(
        (e) => e.start <= dateStr && e.end >= dateStr
    );
}

export default function HrVacationsIndex({
    project,
    workersSummary = [],
    calendarEvents = [],
    vacations,
    workers = [],
    filters = {},
}) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const year = filters.year || new Date().getFullYear();
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.hr.vacations.index', project.id), { ...filters, ...newFilters }, {
            preserveState: true,
        });
    };

    const { cells, daysInMonth } = buildMonthDays(year, calendarMonth);
    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

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
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Vacations</h2>
                            <p className="mt-0.5 text-sm text-gray-500">View vacation balance, calendar & history</p>
                        </div>
                    </div>
                    <Link
                        href={route('projects.modules.hr.workers.index', project.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <IconUsers className="h-4 w-4" />
                        Workers
                    </Link>
                </div>
            }
        >
            <Head title={`${project?.name} - Vacations`} />

            <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <select
                        value={filters.year || year}
                        onChange={(e) => applyFilters({ year: e.target.value })}
                        className={selectClass + ' max-w-[100px]'}
                    >
                        {[year - 2, year - 1, year, year + 1, year + 2].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <label className="ml-4 text-sm font-medium text-gray-700">Worker</label>
                    <select
                        value={filters.worker_id || ''}
                        onChange={(e) => applyFilters({ worker_id: e.target.value || undefined })}
                        className={selectClass + ' max-w-[200px]'}
                    >
                        <option value="">All</option>
                        {workers.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                    <label className="ml-4 text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => applyFilters({ status: e.target.value || undefined })}
                        className={selectClass + ' max-w-[120px]'}
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Workers summary: used vacation days for all workers */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                        <IconUsers className="h-5 w-5 text-gray-500" />
                        <h3 className="font-medium text-gray-900">Vacation balance by worker ({year})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Worker</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Allocated</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Used</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Remaining</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {workersSummary.map((row) => (
                                    <tr key={row.worker_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{row.worker_name}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{row.allocated} days</td>
                                        <td className="px-6 py-4 text-right text-amber-600">{row.used} days</td>
                                        <td className="px-6 py-4 text-right text-emerald-600">{row.remaining} days</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={route('projects.modules.hr.workers.show', [project.id, row.worker_id])}
                                                className="text-sm font-medium hover:underline"
                                                style={{ color: primaryColor }}
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {workersSummary.length === 0 && (
                        <div className="px-6 py-8 text-center text-sm text-gray-500">No workers in this project.</div>
                    )}
                </div>

                {/* Calendar view: scheduled/approved vacations */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                        <h3 className="flex items-center gap-2 font-medium text-gray-900">
                            <IconCalendar className="h-5 w-5" style={{ color: primaryColor }} />
                            Calendar — approved vacations
                        </h3>
                        <select
                            value={calendarMonth}
                            onChange={(e) => setCalendarMonth(Number(e.target.value))}
                            className={selectClass + ' max-w-[140px]'}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m} {year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">
                                    {d}
                                </div>
                            ))}
                            {cells.map((day, idx) => {
                                const events = getEventsForDay(calendarEvents, year, calendarMonth, day);
                                return (
                                    <div
                                        key={idx}
                                        className="min-h-[80px] bg-white p-1 text-sm"
                                    >
                                        {day != null && <span className="text-gray-700">{day}</span>}
                                        {events.length > 0 && (
                                            <div className="mt-1 space-y-0.5">
                                                {events.slice(0, 2).map((ev) => (
                                                    <div
                                                        key={ev.id}
                                                        className="truncate rounded px-1 py-0.5 text-xs text-white"
                                                        style={{ backgroundColor: primaryColor }}
                                                        title={`${ev.title} (${ev.days_count} days)`}
                                                    >
                                                        {ev.title}
                                                    </div>
                                                ))}
                                                {events.length > 2 && (
                                                    <div className="text-xs text-gray-500">+{events.length - 2}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Historical vacation records */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Vacation history & requests</h3>
                    </div>
                    {vacations?.data?.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Worker</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Days</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {vacations.data.map((v) => (
                                            <tr key={v.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    <Link
                                                        href={route('projects.modules.hr.workers.show', [project.id, v.worker_id])}
                                                        className="hover:underline"
                                                        style={{ color: primaryColor }}
                                                    >
                                                        {v.worker_name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{v.start_date} – {v.end_date}</td>
                                                <td className="px-6 py-4 text-right text-gray-600">{v.days_count} days</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[v.status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {v.status_label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {vacations?.meta?.last_page > 1 && (
                                <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
                                    {vacations.links?.slice(1, -1).map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url || '#'}
                                            className={`rounded px-3 py-1 text-sm ${link.active ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                            style={link.active ? { backgroundColor: `${primaryColor}26`, color: primaryColor } : {}}
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">No vacation records for the selected filters.</div>
                    )}
                </div>
            </div>
        </ProjectLayout>
    );
}
