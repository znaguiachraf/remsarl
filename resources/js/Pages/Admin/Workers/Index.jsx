import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function WorkersIndex({ assignments, users, projects, roles, filters, flash }) {
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

    const handleRemoveClick = (e) => {
        if (!confirm('Remove this worker from the project?')) {
            e.preventDefault();
        }
    };

    const applyFilters = (newFilters) => {
        router.get(route('admin.workers.index'), newFilters, { preserveState: true });
    };

    const selectClass = 'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm';

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-50 p-2">
                            <AdminIcon icon="workers" className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Workers</h1>
                    </div>
                    <PrimaryButton onClick={() => setShowAssignModal(true)} className="flex items-center gap-2">
                        <AdminIcon icon="plus" className="w-5 h-5" />
                        Assign Project
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

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <AdminIcon icon="projects" className="w-4 h-4 text-gray-500" />
                    <select
                        value={filters?.project_id || ''}
                        onChange={(e) => applyFilters({ ...filters, project_id: e.target.value || undefined })}
                        className={`${selectClass} max-w-[180px]`}
                    >
                        <option value="">All projects</option>
                        {projects?.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <AdminIcon icon="users" className="w-4 h-4 text-gray-500" />
                    <select
                        value={filters?.user_id || ''}
                        onChange={(e) => applyFilters({ ...filters, user_id: e.target.value || undefined })}
                        className={`${selectClass} max-w-[200px]`}
                    >
                        <option value="">All users</option>
                        {users?.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <AdminIcon icon="roles" className="w-4 h-4 text-gray-500" />
                    <select
                        value={filters?.role_id || ''}
                        onChange={(e) => applyFilters({ ...filters, role_id: e.target.value || undefined })}
                        className={`${selectClass} max-w-[140px]`}
                    >
                        <option value="">All roles</option>
                        {roles?.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-400" aria-hidden />
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => applyFilters({ ...filters, status: e.target.value || undefined })}
                        className={`${selectClass} max-w-[120px]`}
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                {(filters?.project_id || filters?.user_id || filters?.role_id || filters?.status) && (
                    <button
                        type="button"
                        onClick={() => applyFilters({})}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-2">
                                    <AdminIcon icon="users" className="w-4 h-4 text-gray-400" />
                                    User
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-2">
                                    <AdminIcon icon="projects" className="w-4 h-4 text-gray-400" />
                                    Project
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-2">
                                    <AdminIcon icon="roles" className="w-4 h-4 text-gray-400" />
                                    Role
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-green-400" aria-hidden />
                                    Status
                                </div>
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
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                            <AdminIcon icon="users" className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{a.user?.name}</div>
                                            <div className="text-sm text-gray-500">{a.user?.email}</div>
                                        </div>
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
                                    <Link
                                        href={route('admin.workers.destroy', a.id)}
                                        method="delete"
                                        as="button"
                                        preserveScroll
                                        onClick={handleRemoveClick}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                    >
                                        <AdminIcon icon="trash" className="w-4 h-4" />
                                        Remove
                                    </Link>
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
