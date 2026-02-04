import ProjectLayout from '@/Layouts/ProjectLayout';
import ModuleCard from '@/Components/project/ModuleCard';
import StatusBadge from '@/Components/project/StatusBadge';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ProjectDashboard({ project }) {
    const { enabledModules } = usePage().props;
    const primaryColor = project?.primary_color || '#3B82F6';

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Dashboard
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {project?.description || 'Project overview'}
                        </p>
                    </div>
                    <StatusBadge status={project?.status} />
                </div>
            }
        >
            <Head title={`${project?.name} - Dashboard`} />

            <div className="space-y-8">
                {/* Welcome banner */}
                <div
                    className="relative overflow-hidden rounded-2xl px-6 py-8 shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)`,
                    }}
                >
                    <div className="relative z-10">
                        <h3 className="text-xl font-semibold text-white/95">
                            Welcome to {project?.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/80 max-w-xl">
                            {project?.description || 'Manage your business from one place. Use the modules below to get started.'}
                        </p>
                        <Link
                            href={route('projects.index')}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
                        >
                            Switch project
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </Link>
                    </div>
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
                </div>

                {/* Quick stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Modules enabled</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {enabledModules?.length ?? 0}
                        </p>
                    </div>
                    <Link
                        href={route('projects.workers.index', project?.id)}
                        className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md"
                    >
                        <p className="text-sm font-medium text-gray-500">Workers</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">Manage</p>
                        <p className="mt-1 text-xs text-gray-400">View team members →</p>
                    </Link>
                    <Link
                        href={route('projects.roles.index', project?.id)}
                        className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md"
                    >
                        <p className="text-sm font-medium text-gray-500">Roles</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">Permissions</p>
                        <p className="mt-1 text-xs text-gray-400">Configure access →</p>
                    </Link>
                </div>

                {/* Module cards */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Quick access</h3>
                        <p className="text-sm text-gray-500">
                            {enabledModules?.length ?? 0} modules available
                        </p>
                    </div>
                    {enabledModules?.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {enabledModules.map((module) => (
                                <ModuleCard
                                    key={module.key}
                                    module={module}
                                    href={route('projects.modules.show', [project.id, module.key])}
                                    primaryColor={primaryColor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                </svg>
                            </div>
                            <p className="mt-4 font-medium text-gray-600">No modules enabled</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Edit project settings to enable modules for this project.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProjectLayout>
    );
}
