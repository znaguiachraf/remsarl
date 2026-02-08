import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconCalendar,
    IconDollar,
    IconPencil,
    IconPlus,
    IconTrash,
    IconUsers,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function HrWorkersIndex({ project, workers, filters, can }) {
    const primaryColor = usePage().props.currentProject?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [deletingWorker, setDeletingWorker] = useState(null);

    const createForm = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        hire_date: '',
        employee_number: '',
        cnss_number: '',
    });

    const editForm = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        hire_date: '',
        employee_number: '',
        cnss_number: '',
    });

    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.hr.workers.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('projects.modules.hr.workers.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const openEditModal = (worker) => {
        setEditingWorker(worker);
        editForm.setData({
            first_name: worker.first_name || worker.full_name?.split(' ')[0] || '',
            last_name: worker.last_name || worker.full_name?.split(' ').slice(1).join(' ') || '',
            email: worker.email || '',
            phone: worker.phone || '',
            address: '',
            birth_date: '',
            hire_date: worker.hire_date || '',
            employee_number: worker.employee_number || '',
            cnss_number: worker.cnss_number || '',
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingWorker) return;
        editForm.patch(route('projects.modules.hr.workers.update', [project.id, editingWorker.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingWorker(null),
        });
    };

    const handleDelete = (worker) => {
        router.delete(route('projects.modules.hr.workers.destroy', { project: project.id, worker: worker.id }), {
            preserveScroll: true,
            onSuccess: () => setDeletingWorker(null),
        });
    };

    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <IconUsers className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Workers</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Manage workers, contracts, salaries & attendance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('projects.modules.hr.attendance.index', project.id)}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <IconCalendar className="h-4 w-4" />
                            Attendance Overview
                        </Link>
                        {can?.create && (
                            <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                <IconPlus className="h-4 w-4" />
                                Add Worker
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Workers`} />

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <input
                    type="text"
                    placeholder="Search workers..."
                    value={filters?.search || ''}
                    onChange={(e) => applyFilters({ ...filters, search: e.target.value || undefined })}
                    className={inputClass + ' max-w-[200px]'}
                />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Worker</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contract</th>
                            <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Salary</th>
                            <th className="px-4 py-3 sm:px-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50 sticky right-0 shrink-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {workers?.data?.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 sm:px-6">
                                    <Link
                                        href={route('projects.modules.hr.workers.show', [project.id, w.id])}
                                        className="font-medium text-gray-900 hover:underline"
                                        style={{ color: primaryColor }}
                                    >
                                        {w.full_name}
                                    </Link>
                                    {w.employee_number && (
                                        <div className="text-xs text-gray-500">#{w.employee_number}</div>
                                    )}
                                </td>
                                <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">
                                    {w.email || w.phone || '—'}
                                </td>
                                <td className="px-4 py-4 sm:px-6 text-sm">
                                    {w.active_contract ? (
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800">
                                            {w.active_contract.type_label}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">No contract</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">
                                    {w.active_contract ? (
                                        <><IconDollar className="inline h-4 w-4 text-gray-400" /> {Number(w.active_contract.salary_amount).toLocaleString()}</>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right bg-white sticky right-0 shrink-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] min-w-[80px]">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                        {w.can_update && (
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(w)}
                                                className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 rounded transition hover:opacity-80 shrink-0"
                                                style={{ color: primaryColor }}
                                                title="Edit"
                                            >
                                                <IconPencil className="h-4 w-4" />
                                                <span className="hidden sm:inline sm:ml-0.5">Edit</span>
                                            </button>
                                        )}
                                        {w.can_delete && (
                                            <button
                                                type="button"
                                                onClick={() => setDeletingWorker(w)}
                                                className="inline-flex items-center p-1.5 sm:px-0 sm:py-0 text-red-600 hover:text-red-500 hover:bg-red-50 rounded shrink-0"
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
                {(!workers?.data || workers.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconUsers className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No workers yet.</p>
                        <p className="mt-1 text-sm">Add your first worker to get started.</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <Modal show onClose={() => setShowCreateModal(false)} maxWidth="md">
                    <form onSubmit={handleCreate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Worker</h3>
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="First Name" />
                                    <TextInput value={createForm.data.first_name} onChange={(e) => createForm.setData('first_name', e.target.value)} className="block w-full" required />
                                    <InputError message={createForm.errors.first_name} />
                                </div>
                                <div>
                                    <InputLabel value="Last Name" />
                                    <TextInput value={createForm.data.last_name} onChange={(e) => createForm.setData('last_name', e.target.value)} className="block w-full" required />
                                    <InputError message={createForm.errors.last_name} />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Email" />
                                <TextInput type="email" value={createForm.data.email} onChange={(e) => createForm.setData('email', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="Phone" />
                                <TextInput value={createForm.data.phone} onChange={(e) => createForm.setData('phone', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="Employee Number" />
                                <TextInput value={createForm.data.employee_number} onChange={(e) => createForm.setData('employee_number', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="CNSS Number" />
                                <TextInput value={createForm.data.cnss_number} onChange={(e) => createForm.setData('cnss_number', e.target.value)} className="block w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Hire Date" />
                                    <TextInput type="date" value={createForm.data.hire_date} onChange={(e) => createForm.setData('hire_date', e.target.value)} className="block w-full" />
                                </div>
                                <div>
                                    <InputLabel value="Birth Date" />
                                    <TextInput type="date" value={createForm.data.birth_date} onChange={(e) => createForm.setData('birth_date', e.target.value)} className="block w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={createForm.processing}>Create</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {editingWorker && (
                <Modal show onClose={() => setEditingWorker(null)} maxWidth="md">
                    <form onSubmit={handleUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Worker</h3>
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="First Name" />
                                    <TextInput value={editForm.data.first_name} onChange={(e) => editForm.setData('first_name', e.target.value)} className="block w-full" required />
                                </div>
                                <div>
                                    <InputLabel value="Last Name" />
                                    <TextInput value={editForm.data.last_name} onChange={(e) => editForm.setData('last_name', e.target.value)} className="block w-full" required />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Email" />
                                <TextInput type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="Phone" />
                                <TextInput value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="Employee Number" />
                                <TextInput value={editForm.data.employee_number} onChange={(e) => editForm.setData('employee_number', e.target.value)} className="block w-full" />
                            </div>
                            <div>
                                <InputLabel value="CNSS Number" />
                                <TextInput value={editForm.data.cnss_number} onChange={(e) => editForm.setData('cnss_number', e.target.value)} className="block w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Hire Date" />
                                    <TextInput type="date" value={editForm.data.hire_date} onChange={(e) => editForm.setData('hire_date', e.target.value)} className="block w-full" />
                                </div>
                                <div>
                                    <InputLabel value="Birth Date" />
                                    <TextInput type="date" value={editForm.data.birth_date} onChange={(e) => editForm.setData('birth_date', e.target.value)} className="block w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setEditingWorker(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>Save</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {deletingWorker && (
                <Modal show onClose={() => setDeletingWorker(null)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Worker</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete &quot;{deletingWorker.full_name}&quot;? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton onClick={() => setDeletingWorker(null)}>Cancel</SecondaryButton>
                            <PrimaryButton onClick={() => handleDelete(deletingWorker)} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">Delete</PrimaryButton>
                        </div>
                    </div>
                </Modal>
            )}

            {workers?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {workers.data.length} of {workers.meta.total} workers
                    </p>
                    <div className="flex gap-2">
                        {workers.links?.map((link, i) => (
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
