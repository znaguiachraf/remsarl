import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AdminProjectEdit({ project }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: project?.name ?? '',
        description: project?.description ?? '',
        primary_color: project?.primary_color ?? '#3B82F6',
        secondary_color: project?.secondary_color ?? '#10B981',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.projects.update', project.id));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.dashboard')}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div className="rounded-lg bg-indigo-50 p-2">
                        <AdminIcon icon="projects" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                        <p className="text-sm text-gray-500">{project?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit - ${project?.name} - Admin`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900">Project Colors</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Customize the primary and secondary colors used across this project.
                    </p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="primary_color" value="Primary Color" />
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="color"
                                    id="primary_color"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                                />
                                <TextInput
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <InputError message={errors.primary_color} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="secondary_color" value="Secondary Color" />
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="color"
                                    id="secondary_color"
                                    value={data.secondary_color}
                                    onChange={(e) => setData('secondary_color', e.target.value)}
                                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                                />
                                <TextInput
                                    value={data.secondary_color}
                                    onChange={(e) => setData('secondary_color', e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <InputError message={errors.secondary_color} className="mt-1" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900">Basic Info</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Project Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <PrimaryButton type="submit" disabled={processing}>
                        Save Changes
                    </PrimaryButton>
                    <Link href={route('admin.dashboard')}>
                        <SecondaryButton type="button">Cancel</SecondaryButton>
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
