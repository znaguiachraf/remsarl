import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import StatusBadge from '@/Components/project/StatusBadge';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const STEPS = ['Basic Info', 'Branding', 'Location & Status', 'Modules'];

export default function ProjectCreate({ availableModules }) {
    const [step, setStep] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        address: '',
        phone: '',
        city: '',
        country: '',
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        logo: null,
        status: 'active',
        enabled_modules: [],
    });

    const enabledModulesList = Array.isArray(data.enabled_modules) ? data.enabled_modules : [];

    const handleModuleToggle = (key) => {
        const list = Array.isArray(data.enabled_modules) ? data.enabled_modules : [];
        const newList = list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
        setData('enabled_modules', newList);
    };

    const submit = (e) => {
        e.preventDefault();
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            post(route('projects.store'));
        }
    };

    const prev = () => setStep(Math.max(0, step - 1));

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Project
                </h2>
            }
        >
            <Head title="Create Project" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex gap-2">
                        {STEPS.map((label, i) => (
                            <div
                                key={label}
                                className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
                                    i === step
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : i < step
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-gray-50 text-gray-400'
                                }`}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={submit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
                        {step === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Project Name" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
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
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Logo" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('logo', e.target.files[0])}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    <InputError message={errors.logo} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="address" value="Address" />
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="city" value="City" />
                                        <TextInput
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="country" value="Country" />
                                        <TextInput
                                            id="country"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Status" />
                                    <div className="mt-2 flex gap-2">
                                        {['active', 'suspended', 'archived'].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setData('status', s)}
                                                className={`rounded-lg border px-3 py-1.5 text-sm ${
                                                    data.status === s
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <StatusBadge status={s} size="sm" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Select which modules to enable for this project.
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {availableModules?.map((module) => (
                                        <label
                                            key={module.key}
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                                enabledModulesList.includes(module.key)
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={enabledModulesList.includes(module.key)}
                                                onChange={() => handleModuleToggle(module.key)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="font-medium text-gray-900">{module.name}</span>
                                            {module.description && (
                                                <span className="text-sm text-gray-500">{module.description}</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <SecondaryButton type="button" onClick={prev} disabled={step === 0}>
                                Previous
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {step === STEPS.length - 1 ? 'Create Project' : 'Next'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
