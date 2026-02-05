import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') return Object.values(val).map(Number).filter(Boolean);
    return [];
}

export default function RoleEdit({ role, permissions }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: role?.name ?? '',
        slug: role?.slug ?? '',
        description: role?.description ?? '',
        level: role?.level ?? 40,
        permission_ids: ensureArray(role?.permission_ids),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.roles.update', role.id));
    };

    const permissionIds = ensureArray(data.permission_ids);

    const togglePermission = (id) => {
        setData('permission_ids',
            permissionIds.includes(id) ? permissionIds.filter((p) => p !== id) : [...permissionIds, id]
        );
    };

    const byModule = (permissions || []).reduce((acc, p) => {
        const m = p.module || 'other';
        if (!acc[m]) acc[m] = [];
        acc[m].push(p);
        return acc;
    }, {});

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2">
                        <AdminIcon icon="roles" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
                </div>
            }
        >
            <Head title={`Edit ${role?.name} - Admin`} />

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="slug" value="Slug" />
                        <TextInput
                            id="slug"
                            className="mt-1 block w-full"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            required
                        />
                        <InputError message={errors.slug} />
                    </div>
                    <div>
                        <InputLabel htmlFor="level" value="Level (0-100)" />
                        <input
                            type="number"
                            id="level"
                            min="0"
                            max="100"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.level}
                            onChange={(e) => setData('level', parseInt(e.target.value, 10))}
                        />
                        <InputError message={errors.level} />
                    </div>
                    <div>
                        <InputLabel htmlFor="description" value="Description (optional)" />
                        <textarea
                            id="description"
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <InputLabel value="Permissions" />
                    <div className="mt-4 space-y-4 max-h-64 overflow-y-auto">
                        {Object.entries(byModule).map(([module, perms]) => (
                            <div key={module}>
                                <h4 className="text-sm font-medium text-gray-700 capitalize">
                                    {module}
                                </h4>
                                <div className="mt-2 space-y-2">
                                    {perms.map((perm) => (
                                        <label key={perm.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={permissionIds.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {perm.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <PrimaryButton type="submit" disabled={processing}>
                        Update Role
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => window.history.back()}>
                        Cancel
                    </SecondaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
