import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router } from '@inertiajs/react';

export default function PermissionsIndex({ permissions, flash }) {
    const handleDelete = (id) => {
        if (confirm('Delete this permission? This may affect role assignments.')) {
            router.delete(route('admin.permissions.destroy', id));
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-50 p-2">
                            <AdminIcon icon="permissions" className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
                    </div>
                    <Link href={route('admin.permissions.create')}>
                        <PrimaryButton className="flex items-center gap-2">
                            <AdminIcon icon="plus" className="w-5 h-5" />
                            Create Permission
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Permissions - Admin" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
                    {flash.success}
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-2">
                                    <AdminIcon icon="permissions" className="w-4 h-4 text-gray-400" />
                                    Name
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Module
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {permissions?.map((perm) => (
                            <tr key={perm.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                                            <AdminIcon icon="permissions" className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{perm.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {perm.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {perm.module || '—'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {perm.description || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <Link
                                            href={route('admin.permissions.edit', perm.id)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                        >
                                            <AdminIcon icon="pencil" className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(perm.id)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                        >
                                            <AdminIcon icon="trash" className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!permissions || permissions.length === 0) && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No permissions yet.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
