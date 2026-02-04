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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
                    <Link href={route('admin.permissions.create')}>
                        <PrimaryButton>Create Permission</PrimaryButton>
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

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
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
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {perm.name}
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
                                    <Link
                                        href={route('admin.permissions.edit', perm.id)}
                                        className="mr-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(perm.id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
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
