import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconCheck,
    IconCheckSquare,
    IconPlus,
    IconTrash,
    IconUsers,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function TasksIndex({ project, tasks, workers, filters, can }) {
    const { flash } = usePage().props;
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deletingTask, setDeletingTask] = useState(null);

    const createForm = useForm({
        worker_id: '',
        title: '',
        description: '',
        due_date: '',
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.tasks.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('projects.modules.tasks.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleComplete = (task) => {
        router.post(route('projects.modules.tasks.complete', [project.id, task.id]), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (task) => {
        router.delete(route('projects.modules.tasks.destroy', { project: project.id, task: task.id }), {
            preserveScroll: true,
            onSuccess: () => setDeletingTask(null),
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
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                                {can?.manage_all_tasks ? 'Tasks' : 'My Tasks'}
                            </h2>
                            <p className="mt-0.5 text-sm text-gray-500">
                                {can?.manage_all_tasks ? 'Create and assign tasks to workers' : 'Tasks assigned to you'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can?.manage_all_tasks && can?.show_my_tasks && (
                            <Link
                                href={route('projects.modules.tasks.my-tasks', project.id)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <IconUsers className="h-4 w-4" />
                                My Tasks
                            </Link>
                        )}
                        {can?.manage_all_tasks && can?.create && (
                            <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Add Task
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Tasks`} />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                    {flash.error}
                </div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={filters?.search || ''}
                    onChange={(e) => applyFilters({ ...filters, search: e.target.value || undefined })}
                    className={inputClass + ' max-w-[200px]'}
                />
                {can?.manage_all_tasks && (
                    <select
                        value={filters?.worker_id || ''}
                        onChange={(e) => applyFilters({ ...filters, worker_id: e.target.value || undefined })}
                        className={inputClass + ' max-w-[180px]'}
                    >
                        <option value="">All workers</option>
                        {workers?.map((w) => (
                            <option key={w.id} value={w.id}>{w.full_name}</option>
                        ))}
                    </select>
                )}
                <select
                    value={filters?.status || ''}
                    onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                    className={inputClass + ' max-w-[140px]'}
                >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                </select>
                <div className="flex items-center gap-2">
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
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Task</th>
                            {can?.manage_all_tasks && (
                                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assigned to</th>
                            )}
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
                                {can?.manage_all_tasks && (
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {t.worker?.full_name || '—'}
                                    </td>
                                )}
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
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                        {t.can_complete && t.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => handleComplete(t)}
                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 sm:px-2.5 sm:gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 shrink-0"
                                                title="Mark done"
                                            >
                                                <IconCheck className="h-4 w-4" />
                                                <span className="hidden sm:inline">Mark done</span>
                                            </button>
                                        )}
                                        {t.can_delete && (
                                            <button
                                                type="button"
                                                onClick={() => setDeletingTask(t)}
                                                className="p-1.5 sm:px-0 sm:py-0 text-red-600 hover:text-red-500 hover:bg-red-50 rounded shrink-0"
                                                title="Delete"
                                            >
                                                <IconTrash className="h-4 w-4" />
                                                <span className="hidden sm:inline sm:ml-0.5">Delete</span>
                                            </button>
                                        )}
                                    </div>
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
                        <p className="font-medium">No tasks yet.</p>
                        <p className="mt-1 text-sm">Create your first task and assign it to a worker.</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <Modal show onClose={() => setShowCreateModal(false)} maxWidth="md">
                    <form onSubmit={handleCreate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Create Task</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Assign to worker" />
                                <select
                                    value={createForm.data.worker_id}
                                    onChange={(e) => createForm.setData('worker_id', e.target.value)}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select worker</option>
                                    {workers?.map((w) => (
                                        <option key={w.id} value={w.id}>{w.full_name}</option>
                                    ))}
                                </select>
                                <InputError message={createForm.errors.worker_id} />
                            </div>
                            <div>
                                <InputLabel value="Title" />
                                <TextInput
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    className="block w-full"
                                    required
                                />
                                <InputError message={createForm.errors.title} />
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <textarea
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    rows={3}
                                    className={inputClass}
                                />
                                <InputError message={createForm.errors.description} />
                            </div>
                            <div>
                                <InputLabel value="Due date" />
                                <TextInput
                                    type="date"
                                    value={createForm.data.due_date}
                                    onChange={(e) => createForm.setData('due_date', e.target.value)}
                                    className="block w-full"
                                />
                                <InputError message={createForm.errors.due_date} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={createForm.processing}>Create</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {deletingTask && (
                <Modal show onClose={() => setDeletingTask(null)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete &quot;{deletingTask.title}&quot;? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton onClick={() => setDeletingTask(null)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={() => handleDelete(deletingTask)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            )}

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
