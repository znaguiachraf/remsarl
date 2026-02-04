import ProjectLayout from '@/Layouts/ProjectLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ModuleDisabled({ moduleKey, message }) {
    const { currentProject } = usePage().props;

    return (
        <ProjectLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Module Not Available
                </h2>
            }
        >
            <Head title={`${moduleKey} - Not Enabled`} />

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-12 text-center">
                <div className="rounded-full bg-amber-100 p-4">
                    <svg
                        className="h-12 w-12 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Module Not Enabled</h3>
                <p className="mt-2 max-w-sm text-gray-600">{message}</p>
                <p className="mt-1 text-sm text-gray-500">
                    This module is not enabled for <strong>{currentProject?.name}</strong>. Contact the project owner to enable it.
                </p>
                <Link href={route('projects.show', currentProject?.id)} className="mt-6">
                    <PrimaryButton>Back to Dashboard</PrimaryButton>
                </Link>
            </div>
        </ProjectLayout>
    );
}
