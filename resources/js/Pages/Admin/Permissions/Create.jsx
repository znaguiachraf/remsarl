import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function PermissionCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        module: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.permissions.store'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2">
                        <AdminIcon icon="permissions" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Permission</h1>
                </div>
            }
        >
            <Head title="Create Permission - Admin" />

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                    <InputLabel htmlFor="slug" value="Slug (e.g. module.action)" />
                    <TextInput
                        id="slug"
                        className="mt-1 block w-full"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        placeholder="e.g. products.create"
                        required
                    />
                    <InputError message={errors.slug} />
                </div>
                <div>
                    <InputLabel htmlFor="module" value="Module (optional)" />
                    <TextInput
                        id="module"
                        className="mt-1 block w-full"
                        value={data.module}
                        onChange={(e) => setData('module', e.target.value)}
                        placeholder="e.g. products"
                    />
                    <InputError message={errors.module} />
                </div>
                <div>
                    <InputLabel htmlFor="description" value="Description (optional)" />
                    <textarea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} />
                </div>
                <div className="flex gap-3">
                    <PrimaryButton type="submit" disabled={processing}>
                        Create
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => window.history.back()}>
                        Cancel
                    </SecondaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
