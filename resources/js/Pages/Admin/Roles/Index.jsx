import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router } from '@inertiajs/react';

export default function RolesIndex({ roles, flash }) {
    const handleDelete = (id, slug) => {
        if (confirm('Delete this role?')) {
            router.delete(route('admin.roles.destroy', id));
        }
    };

    const systemRoles = ['owner', 'admin', 'manager', 'member', 'viewer'];

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-50 p-2">
                            <AdminIcon icon="roles" className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                    </div>
                    <Link href={route('admin.roles.create')}>
                        <PrimaryButton className="flex items-center gap-2">
                            <AdminIcon icon="plus" className="w-5 h-5" />
                            Create Role
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Roles - Admin" />

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

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {roles?.map((role) => (
                    <div
                        key={role.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{role.name}</h3>
                                <p className="mt-0.5 text-sm text-gray-500">{role.description}</p>
                                <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                    Level {role.level}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={route('admin.roles.edit', role.id)}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Edit
                                </Link>
                                {!systemRoles.includes(role.slug) && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(role.id, role.slug)}
                                        className="text-sm font-medium text-red-600 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                Permissions ({role.permissions?.length ?? 0})
                            </h4>
                            <ul className="mt-2 max-h-24 overflow-y-auto space-y-1">
                                {role.permissions?.slice(0, 5).map((perm) => (
                                    <li key={perm.id} className="text-sm text-gray-600">
                                        {perm.name}
                                    </li>
                                ))}
                                {role.permissions?.length > 5 && (
                                    <li className="text-sm text-gray-400">
                                        +{role.permissions.length - 5} more
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            {(!roles || roles.length === 0) && (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                    No roles yet.
                </div>
            )}
        </AdminLayout>
    );
}
