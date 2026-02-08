import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function NotesIndex({ project, notes, workers, filters, can = {}, hasHrModule = false }) {
    const page = usePage();
    const primaryColor = page.props.currentProject?.primary_color || '#3B82F6';
    const secondaryColor = page.props.currentProject?.secondary_color || '#10B981';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showAddModal, setShowAddModal] = useState(false);

    const addForm = useForm({
        worker_id: '',
        content: '',
        direction: 'to_employee',
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.notes.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        addForm.post(route('projects.notes.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddModal(false);
            },
        });
    };

    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    const directionLabel = (d) => (d === 'to_employee' ? 'To employee' : 'From employee');

    const workerLink = (worker) =>
        hasHrModule ? (
            <Link
                href={route('projects.modules.hr.workers.show', [project.id, worker.id])}
                className="font-medium hover:underline"
                style={{ color: primaryColor }}
            >
                {worker.full_name}
            </Link>
        ) : (
            <span className="font-medium">{worker.full_name}</span>
        );

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: primaryColor + '20', color: primaryColor }}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Employee Notes</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Notes to and from employees</p>
                        </div>
                    </div>
                    {can?.create && (
                        <PrimaryButton onClick={() => setShowAddModal(true)}>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Note
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title={`${project?.name} - Employee Notes`} />

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <label className="text-sm font-medium text-gray-700">Filter by worker:</label>
                <select
                    value={filters?.worker_id || ''}
                    onChange={(e) => applyFilters({ ...filters, worker_id: e.target.value || undefined })}
                    className={inputClass + ' max-w-[220px]'}
                >
                    <option value="">All workers</option>
                    {workers?.map((w) => (
                        <option key={w.id} value={w.id}>
                            {w.full_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {notes?.length === 0 ? (
                        <div className="px-4 py-12 text-center text-gray-500">
                            No notes yet. Add a note to or from an employee.
                        </div>
                    ) : (
                        notes?.map((note) => (
                            <div
                                key={note.id}
                                className="px-4 py-4 sm:px-6 sm:py-5 hover:bg-gray-50/50"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                            {workerLink(note.worker)}
                                            <span>{directionLabel(note.direction)}</span>
                                            <span>{note.author.name}</span>
                                            <span>
                                                {new Date(note.created_at).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        style={{
                                            backgroundColor: note.direction === 'to_employee' ? primaryColor + '20' : secondaryColor + '20',
                                            color: note.direction === 'to_employee' ? primaryColor : secondaryColor,
                                        }}
                                    >
                                        {directionLabel(note.direction)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showAddModal && (
                <Modal show onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAdd} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Add Employee Note</h3>
                        <p className="mt-1 text-sm text-gray-500">Add a note to or from an employee.</p>

                        <div className="mt-4">
                            <InputLabel htmlFor="worker_id">Worker</InputLabel>
                            <select
                                id="worker_id"
                                className={inputClass}
                                value={addForm.data.worker_id}
                                onChange={(e) => addForm.setData('worker_id', e.target.value)}
                                required
                            >
                                <option value="">Select worker</option>
                                {workers?.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.full_name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={addForm.errors.worker_id} />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="direction">Direction</InputLabel>
                            <select
                                id="direction"
                                className={inputClass}
                                value={addForm.data.direction}
                                onChange={(e) => addForm.setData('direction', e.target.value)}
                            >
                                <option value="to_employee">To employee</option>
                                <option value="from_employee">From employee</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="content">Content</InputLabel>
                            <textarea
                                id="content"
                                className={inputClass}
                                rows={4}
                                value={addForm.data.content}
                                onChange={(e) => addForm.setData('content', e.target.value)}
                                placeholder="Enter note content..."
                                required
                            />
                            <InputError message={addForm.errors.content} />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={addForm.processing}>
                                Add Note
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
