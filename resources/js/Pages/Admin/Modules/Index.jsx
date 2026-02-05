import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function ModulesIndex({ projects, flash }) {
    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2">
                        <AdminIcon icon="modules" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Modules</h1>
                </div>
            }
        >
            <Head title="Modules - Admin" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
                    {flash.success}
                </div>
            )}

            <p className="mb-6 text-gray-600">
                Enable or disable modules for each project. Only admins can manage project modules.
            </p>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-2">
                                    <AdminIcon icon="projects" className="w-4 h-4 text-gray-400" />
                                    Project
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Enabled Modules
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {projects?.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                                            <AdminIcon icon="projects" className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{project.name}</div>
                                            <div className="text-sm text-gray-500">{project.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                                        {project.enabled_count ?? 0} modules
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        href={route('admin.modules.edit', project.id)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                    >
                                        <AdminIcon icon="pencil" className="w-4 h-4" />
                                        Manage Modules
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!projects || projects.length === 0) && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No projects yet.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
