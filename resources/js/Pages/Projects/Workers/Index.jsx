import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/project/StatusBadge';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function WorkersIndex({ project, workers, roles }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);

    const addForm = useForm({
        email: '',
        role_id: '',
    });

    const roleForm = useForm({
        role_id: '',
    });

    const handleAddWorker = (e) => {
        e.preventDefault();
        addForm.post(route('projects.workers.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddModal(false);
            },
        });
    };

    const openRoleModal = (worker) => {
        setEditingWorker(worker);
        roleForm.setData('role_id', worker.role?.id?.toString() || '');
        setShowRoleModal(true);
    };

    const handleUpdateRole = (e) => {
        e.preventDefault();
        if (!editingWorker) return;
        roleForm.patch(route('projects.workers.update', [project.id, editingWorker.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRoleModal(false);
                setEditingWorker(null);
            },
        });
    };

    const removeWorker = (workerId) => {
        if (confirm('Remove this worker from the project?')) {
            router.delete(route('projects.workers.destroy', [project.id, workerId]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Workers
                    </h2>
                    <PrimaryButton onClick={() => setShowAddModal(true)}>
                        Add Worker
                    </PrimaryButton>
                </div>
            }
        >
            <Head title={`${project?.name} - Workers`} />

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {workers?.map((worker) => (
                            <tr key={worker.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="font-medium text-gray-900">{worker.name}</div>
                                        <div className="text-sm text-gray-500">{worker.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                                        {worker.role?.name || '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={worker.status} size="sm" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openRoleModal(worker)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Change Role
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            type="button"
                                            onClick={() => removeWorker(worker.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!workers || workers.length === 0) && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No workers assigned yet.
                    </div>
                )}
            </div>

            {showRoleModal && editingWorker && (
                <Modal show={true} onClose={() => { setShowRoleModal(false); setEditingWorker(null); }} maxWidth="md">
                    <form onSubmit={handleUpdateRole} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Change Role</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Update the role for {editingWorker.name} ({editingWorker.email}).
                        </p>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={roleForm.data.role_id}
                                onChange={(e) => roleForm.setData('role_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select role</option>
                                {roles?.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {roleForm.errors.role_id && (
                                <p className="mt-1 text-sm text-red-600">{roleForm.errors.role_id}</p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => { setShowRoleModal(false); setEditingWorker(null); }}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={roleForm.processing}>
                                Update Role
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
                        <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h3 className="text-lg font-medium text-gray-900">Add Worker</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Invite a user to this project with a role.
                            </p>
                            <form onSubmit={handleAddWorker} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={addForm.data.email}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="user@example.com"
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                    />
                                    {addForm.errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{addForm.errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={addForm.data.role_id}
                                        onChange={(e) => addForm.setData('role_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select role</option>
                                        {roles?.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <PrimaryButton type="submit" disabled={addForm.processing}>
                                        Add
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </ProjectLayout>
    );
}
