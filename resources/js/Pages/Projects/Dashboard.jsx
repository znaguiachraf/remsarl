import ProjectLayout from '@/Layouts/ProjectLayout';
import ModuleCard from '@/Components/project/ModuleCard';
import StatusBadge from '@/Components/project/StatusBadge';
import { Head, Link, usePage } from '@inertiajs/react';

/** Modules with dedicated routes - use direct link instead of generic modules.show */
const moduleRouteMap = {
    hr: (projectId) => route('projects.modules.hr.workers.index', projectId),
    suppliers: (projectId) => route('projects.modules.suppliers.index', projectId),
    products: (projectId) => route('projects.modules.products.index', projectId),
    sales: (projectId) => route('projects.modules.sales.index', projectId),
    stock: (projectId) => route('projects.modules.stock.index', projectId),
    pos: (projectId) => route('projects.modules.pos.index', projectId),
    payments: (projectId) => route('projects.modules.payments.index', projectId),
    expenses: (projectId) => route('projects.modules.expenses.index', projectId),
    logs: (projectId) => route('projects.modules.logs.index', projectId),
};
const getModuleHref = (projectId, moduleKey) =>
    moduleRouteMap[moduleKey]?.(projectId) ?? route('projects.modules.show', [projectId, moduleKey]);

export default function ProjectDashboard({ project, can }) {
    const { enabledModules, auth } = usePage().props;
    const primaryColor = project?.primary_color || '#3B82F6';

    return (
        <ProjectLayout
            // header={
            //     <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            //         <div className="min-w-0 flex-1 text-left">
            //             <h2 className="text-lg font-semibold leading-tight text-gray-800 sm:text-xl">
            //                 Dashboard
            //             </h2>
            //             <p className="mt-0.5 text-sm text-gray-500 line-clamp-2 sm:line-clamp-none">
            //                 {project?.description || 'Project overview'}
            //             </p>
            //         </div>
            //         <div className="flex min-h-[44px] shrink-0 items-center justify-end gap-2">
            //             <StatusBadge status={project?.status} />
            //         </div>
            //     </div>
            // }
        >
            <Head title={`${project?.name} - Dashboard`} />

            <div className="space-y-5 sm:space-y-8" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                {/* Welcome banner - compact on mobile */}
                <div
                    className="relative overflow-hidden rounded-xl px-4 py-5 shadow-lg sm:rounded-2xl sm:px-6 sm:py-8"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)`,
                    }}
                >
                    <div className="relative z-10">
                        <h3 className="text-lg font-semibold text-white/95 sm:text-xl">
                            Welcome to {project?.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/80 line-clamp-2 sm:line-clamp-none sm:max-w-xl">
                            {project?.description || 'Manage your business from one place. Use the modules below to get started.'}
                        </p>
                        <Link
                            href={route('projects.index')}
                            className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition active:scale-[0.98] hover:bg-white/30 touch-manipulation sm:mt-4 sm:min-h-0 sm:py-2"
                        >
                            Switch project
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </Link>
                    </div>
                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 sm:-right-8 sm:-top-8 sm:h-32 sm:w-32" />
                    <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white/5 sm:-bottom-4 sm:-right-4 sm:h-24 sm:w-24" />
                </div>

                {/* Quick stats - 2 cols on mobile, 3 on larger */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">Modules</p>
                        <p className="mt-0.5 text-xl font-bold text-gray-900 sm:mt-1 sm:text-2xl">
                            {enabledModules?.length ?? 0}
                        </p>
                    </div>
                    <Link
                        href={route('projects.workers.index', project?.id)}
                        className="flex min-h-[80px] flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-gray-200 hover:shadow-md touch-manipulation sm:min-h-0 sm:p-5"
                    >
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">Workers</p>
                        <p className="mt-0.5 text-lg font-bold text-gray-900 sm:mt-1 sm:text-2xl">Manage</p>
                        <p className="mt-0.5 text-[10px] text-gray-400 sm:mt-1 sm:text-xs">Team →</p>
                    </Link>
                    <Link
                        href={route('projects.roles.index', project?.id)}
                        className="col-span-2 flex min-h-[80px] flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-gray-200 hover:shadow-md touch-manipulation sm:col-span-1 sm:min-h-0 sm:p-5"
                    >
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">Roles</p>
                        <p className="mt-0.5 text-lg font-bold text-gray-900 sm:mt-1 sm:text-2xl">Permissions</p>
                        <p className="mt-0.5 text-[10px] text-gray-400 sm:mt-1 sm:text-xs">Access →</p>
                    </Link>
                </div>

                {/* Module cards - 2 cols on mobile for quick tap */}
                <div>
                    <div className="mb-3 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Quick access</h3>
                        <p className="text-xs text-gray-500 sm:text-sm">
                            {enabledModules?.length ?? 0} modules
                        </p>
                    </div>
                    {enabledModules?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                            {enabledModules.map((module) => (
                                <ModuleCard
                                    key={module.key}
                                    module={module}
                                    href={getModuleHref(project.id, module.key)}
                                    primaryColor={primaryColor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center sm:p-12">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 sm:h-12 sm:w-12">
                                <svg
                                    className="h-5 w-5 text-gray-400 sm:h-6 sm:w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-medium text-gray-600 sm:mt-4 sm:text-base">No modules enabled</p>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Edit project settings to enable modules.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProjectLayout>
    );
}
