import ProjectLayout from '@/Layouts/ProjectLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ModulePlaceholder({ project, moduleKey, moduleName }) {
    const { currentProject } = usePage().props;

    return (
        <ProjectLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {moduleName}
                </h2>
            }
        >
            <Head title={`${moduleName} - ${project?.name}`} />

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
                <div className="rounded-full bg-gray-100 p-4">
                    <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{moduleName} Module</h3>
                <p className="mt-2 max-w-sm text-gray-600">
                    This module is enabled. Add module-specific pages in <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">resources/js/Pages/Modules/{moduleKey}/</code>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Lazy-load module components for better performance.
                </p>
                <Link href={route('projects.show', currentProject?.id)} className="mt-6">
                    <PrimaryButton>Back to Dashboard</PrimaryButton>
                </Link>
            </div>
        </ProjectLayout>
    );
}
