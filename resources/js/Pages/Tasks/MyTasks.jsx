import ProjectLayout from '@/Layouts/ProjectLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { IconCheck, IconCheckSquare } from '@/Components/expense/Icons';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function MyTasks({ project, worker, tasks, filters }) {
    const { flash } = usePage().props;
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.tasks.my-tasks', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleComplete = (task) => {
        router.post(route('projects.modules.tasks.complete', [project.id, task.id]), {}, {
            preserveScroll: true,
        });
    };

    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <IconCheckSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">My Tasks</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Tasks assigned to {worker?.full_name}</p>
                        </div>
                    </div>
                    <Link
                        href={route('projects.modules.tasks.index', project.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        All Tasks
                    </Link>
                </div>
            }
        >
            <Head title={`${project?.name} - My Tasks`} />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <select
                    value={filters?.status || ''}
                    onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                    className={inputClass + ' max-w-[140px]'}
                >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                </select>
                <input
                    type="date"
                    value={filters?.date_day || ''}
                    onChange={(e) => applyFilters({ ...filters, date_day: e.target.value || undefined, date_month: undefined })}
                    className={inputClass + ' max-w-[150px]'}
                    title="Filter by day"
                />
                <input
                    type="month"
                    value={filters?.date_month || ''}
                    onChange={(e) => applyFilters({ ...filters, date_month: e.target.value || undefined, date_day: undefined })}
                    className={inputClass + ' max-w-[160px]'}
                    title="Filter by month"
                />
                {(filters?.date_day || filters?.date_month) && (
                    <button
                        type="button"
                        onClick={() => applyFilters({ ...filters, date_day: undefined, date_month: undefined })}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Clear date
                    </button>
                )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Task</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                            <th className="px-4 py-3 sm:px-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50 sticky right-0 shrink-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tasks?.data?.map((t) => (
                            <tr
                                key={t.id}
                                className={`transition-colors ${
                                    t.status === 'done'
                                        ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border-l-4 border-l-emerald-400'
                                        : 'bg-amber-50/50 hover:bg-amber-100/70 border-l-4 border-l-amber-400'
                                }`}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{t.title}</div>
                                    {t.description && (
                                        <div className="mt-0.5 text-sm text-gray-500 line-clamp-2">{t.description}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        t.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {t.status_label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {t.created_at}
                                    {t.completed_at && (
                                        <div className="text-xs text-gray-500">Done: {t.completed_at}</div>
                                    )}
                                </td>
                                <td className={`px-4 py-4 sm:px-6 whitespace-nowrap text-right sticky right-0 shrink-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] min-w-[80px] ${t.status === 'done' ? 'bg-emerald-50/70' : 'bg-amber-50/50'}`}>
                                    {t.can_complete && t.status === 'pending' && (
                                        <PrimaryButton
                                            onClick={() => handleComplete(t)}
                                            className="inline-flex items-center gap-1 sm:gap-1.5 shrink-0"
                                            title="Mark as done"
                                        >
                                            <IconCheck className="h-4 w-4" />
                                            <span className="hidden sm:inline">Mark as done</span>
                                        </PrimaryButton>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!tasks?.data || tasks.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconCheckSquare className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No tasks assigned to you.</p>
                        <p className="mt-1 text-sm">Tasks assigned by your manager will appear here.</p>
                    </div>
                )}
            </div>

            {tasks?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {tasks.data.length} of {tasks.meta.total} tasks
                    </p>
                    <div className="flex gap-2">
                        {tasks.links?.map((link, i) => (
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
        </ProjectLayout>
    );
}
