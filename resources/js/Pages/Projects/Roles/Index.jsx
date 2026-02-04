import ProjectLayout from '@/Layouts/ProjectLayout';
import { Head } from '@inertiajs/react';

export default function RolesIndex({ project, roles }) {
    return (
        <ProjectLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Roles & Permissions
                </h2>
            }
        >
            <Head title={`${project?.name} - Roles`} />

            <div className="space-y-6">
                <p className="text-gray-600">
                    Roles define what actions users can perform within this project. Permissions are global and assigned per role.
                </p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {roles?.map((role) => (
                        <div
                            key={role.id}
                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                                    <p className="mt-0.5 text-sm text-gray-500">{role.description}</p>
                                    <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                        Level {role.level}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Permissions
                                </h4>
                                <ul className="mt-2 space-y-1">
                                    {role.permissions?.slice(0, 5).map((perm) => (
                                        <li
                                            key={perm.id}
                                            className="text-sm text-gray-600"
                                        >
                                            {perm.name}
                                        </li>
                                    ))}
                                    {role.permissions?.length > 5 && (
                                        <li className="text-sm text-gray-400">
                                            +{role.permissions.length - 5} more
                                        </li>
                                    )}
                                    {(!role.permissions || role.permissions.length === 0) && (
                                        <li className="text-sm text-gray-400">No permissions</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ProjectLayout>
    );
}
