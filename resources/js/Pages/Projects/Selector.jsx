import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import StatusBadge from '@/Components/project/StatusBadge';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ProjectSelector({ projects }) {
    const { auth } = usePage().props;
    const canCreateProject = auth?.user?.is_admin ?? false;
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Select a Project
                </h2>
            }
        >
            <Head title="Projects" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <p className="text-gray-600">
                            Choose a project to work on or create a new one.
                        </p>
                        {canCreateProject && (
                            <Link href={route('projects.create')}>
                                <PrimaryButton>Create Project</PrimaryButton>
                            </Link>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects?.length > 0 ? (
                            projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route('projects.show', project.id)}
                                    className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                                >
                                    {project.logo ? (
                                        <img
                                            src={project.logo}
                                            alt={project.name}
                                            className="h-14 w-14 rounded-lg object-cover shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="h-14 w-14 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0"
                                            style={{ backgroundColor: project.primary_color || '#3B82F6' }}
                                        >
                                            {project.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 truncate">
                                            {project.name}
                                        </h3>
                                        <StatusBadge status={project.status} size="sm" />
                                    </div>
                                    <svg
                                        className="h-5 w-5 text-gray-400 group-hover:text-gray-600 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                                <p className="text-gray-600">No projects yet.</p>
                                {canCreateProject && (
                                    <Link href={route('projects.create')} className="mt-4 inline-block">
                                        <PrimaryButton>Create your first project</PrimaryButton>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
