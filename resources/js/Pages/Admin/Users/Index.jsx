import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UsersIndex({ users, flash }) {
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUser, setResetUser] = useState(null);

    const resetForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const openResetModal = (user) => {
        setResetUser(user);
        resetForm.reset();
        setShowResetModal(true);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!resetUser) return;
        resetForm.post(route('admin.users.reset-password', resetUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowResetModal(false);
                setResetUser(null);
            },
        });
    };

    const handleBlock = (user) => {
        if (confirm(`Block ${user.name}? They will not be able to log in.`)) {
            router.post(route('admin.users.block', user.id), {}, { preserveScroll: true });
        }
    };

    const handleUnblock = (user) => {
        if (confirm(`Unblock ${user.name}?`)) {
            router.post(route('admin.users.unblock', user.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-50 p-2">
                            <AdminIcon icon="users" className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    </div>
                    <Link href={route('admin.users.create')}>
                        <PrimaryButton className="flex items-center gap-2">
                            <AdminIcon icon="plus" className="w-5 h-5" />
                            Create User
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Users - Admin" />

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
                                    <span className="inline-flex h-2 w-2 rounded-full bg-green-400" aria-hidden />
                                    Status
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center justify-end gap-2">
                                    Actions
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                                            <AdminIcon icon="users" className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            {user.is_admin && (
                                                <span className="mt-1 inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                                    <AdminIcon icon="permissions" className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.is_blocked ? (
                                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                            Blocked
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openResetModal(user)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                        >
                                            <AdminIcon icon="key" className="w-4 h-4" />
                                            Reset Password
                                        </button>
                                        {user.is_blocked ? (
                                            <button
                                                type="button"
                                                onClick={() => handleUnblock(user)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                            >
                                                <AdminIcon icon="lock-open" className="w-4 h-4" />
                                                Unblock
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleBlock(user)}
                                                disabled={user.is_admin}
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                                title={user.is_admin ? 'Cannot block admin' : undefined}
                                            >
                                                <AdminIcon icon="lock" className="w-4 h-4" />
                                                Block
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!users || users.length === 0) && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No users yet.
                    </div>
                )}
            </div>

            {showResetModal && resetUser && (
                <Modal
                    show={true}
                    onClose={() => {
                        setShowResetModal(false);
                        setResetUser(null);
                        resetForm.reset();
                    }}
                    maxWidth="md"
                >
                    <form onSubmit={handleResetPassword} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Set a new password for {resetUser.name} ({resetUser.email}).
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    value={resetForm.data.password}
                                    onChange={(e) => resetForm.setData('password', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                    minLength={8}
                                />
                                {resetForm.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{resetForm.errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    value={resetForm.data.password_confirmation}
                                    onChange={(e) => resetForm.setData('password_confirmation', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {resetForm.errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {resetForm.errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    setShowResetModal(false);
                                    setResetUser(null);
                                    resetForm.reset();
                                }}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={resetForm.processing}>
                                Reset Password
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </AdminLayout>
    );
}
