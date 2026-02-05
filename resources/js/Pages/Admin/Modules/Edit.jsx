import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, useForm } from '@inertiajs/react';

function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') return Object.values(val).filter(Boolean);
    return [];
}

export default function ModulesEdit({ project, modules, enabled_module_keys }) {
    const enabledKeys = ensureArray(enabled_module_keys);

    const { data, setData, patch, processing, errors } = useForm({
        enabled_module_keys: enabledKeys,
    });

    const toggleModule = (key) => {
        const current = ensureArray(data.enabled_module_keys);
        const next = current.includes(key)
            ? current.filter((k) => k !== key)
            : [...current, key];
        setData('enabled_module_keys', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.modules.update', project.id));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2">
                        <AdminIcon icon="modules" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Modules</h1>
                        <p className="text-sm text-gray-500">{project?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Modules - ${project?.name} - Admin`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900">Available Modules</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Enable or disable modules for this project. Enabled modules will appear in the project sidebar.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {modules?.map((mod) => {
                            const isEnabled = ensureArray(data.enabled_module_keys).includes(mod.key);
                            return (
                                <label
                                    key={mod.key}
                                    className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition ${
                                        isEnabled
                                            ? 'border-indigo-200 bg-indigo-50/50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={() => toggleModule(mod.key)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{mod.name}</span>
                                        </div>
                                        {mod.description && (
                                            <p className="mt-0.5 text-sm text-gray-500">{mod.description}</p>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    {(!modules || modules.length === 0) && (
                        <p className="text-sm text-gray-500">No modules available.</p>
                    )}
                </div>

                <div className="flex gap-3">
                    <PrimaryButton type="submit" disabled={processing}>
                        Save Changes
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => window.history.back()}>
                        Cancel
                    </SecondaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
