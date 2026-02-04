import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function WorkersIndex({ assignments, users, projects, roles, flash }) {
    const [showAssignModal, setShowAssignModal] = useState(false);

    const assignForm = useForm({
        user_id: '',
        project_id: '',
        role_id: '',
    });

    const handleAssign = (e) => {
        e.preventDefault();
        assignForm.post(route('admin.workers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                assignForm.reset();
                setShowAssignModal(false);
            },
        });
    };

    const handleRemove = (assignmentId) => {
        if (confirm('Remove this worker from the project?')) {
            router.delete(route('admin.workers.destroy', assignmentId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Manage Workers</h1>
                    <PrimaryButton onClick={() => setShowAssignModal(true)}>
                        Assign Project to User
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Workers - Admin" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
                    {flash.error}
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Project
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
                        {assignments?.map((a) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="font-medium text-gray-900">{a.user?.name}</div>
                                        <div className="text-sm text-gray-500">{a.user?.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {a.project?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                                        {a.role?.name || '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 capitalize">
                                        {a.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(a.id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-500"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!assignments || assignments.length === 0) && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No project assignments yet. Assign a user to a project to get started.
                    </div>
                )}
            </div>

            {showAssignModal && (
                <Modal
                    show={true}
                    onClose={() => {
                        setShowAssignModal(false);
                        assignForm.reset();
                    }}
                    maxWidth="md"
                >
                    <form onSubmit={handleAssign} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Assign Project to User</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Add a user to a project with a specific role.
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User</label>
                                <select
                                    value={assignForm.data.user_id}
                                    onChange={(e) => assignForm.setData('user_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select user</option>
                                    {users?.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                {assignForm.errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{assignForm.errors.user_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Project</label>
                                <select
                                    value={assignForm.data.project_id}
                                    onChange={(e) => assignForm.setData('project_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select project</option>
                                    {projects?.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {assignForm.errors.project_id && (
                                    <p className="mt-1 text-sm text-red-600">{assignForm.errors.project_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={assignForm.data.role_id}
                                    onChange={(e) => assignForm.setData('role_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select role</option>
                                    {roles?.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                                {assignForm.errors.role_id && (
                                    <p className="mt-1 text-sm text-red-600">{assignForm.errors.role_id}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    setShowAssignModal(false);
                                    assignForm.reset();
                                }}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={assignForm.processing}>
                                Assign
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </AdminLayout>
    );
}
