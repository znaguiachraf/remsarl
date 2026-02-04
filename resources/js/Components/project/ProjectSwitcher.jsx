import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProjectSwitcher({ currentProject, userProjects, variant = 'light' }) {
    const [open, setOpen] = useState(false);
    const isDark = variant === 'dark';

    const buttonClass = isDark
        ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10 transition-colors w-full min-w-0'
        : 'flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-100 transition-colors w-full min-w-0 border border-gray-200';

    const textClass = isDark ? 'text-white' : 'text-gray-900';
    const subTextClass = isDark ? 'text-white/70' : 'text-gray-500';
    const iconClass = isDark ? 'text-white/70' : 'text-gray-500';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={buttonClass}
            >
                {currentProject?.logo ? (
                    <img
                        src={currentProject.logo}
                        alt={currentProject.name}
                        className="h-9 w-9 rounded-lg object-cover shrink-0"
                    />
                ) : (
                    <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: currentProject?.primary_color || '#3B82F6' }}
                    >
                        {currentProject?.name?.charAt(0) || '?'}
                    </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                    <p className={`font-medium truncate ${textClass}`}>{currentProject?.name || 'Select Project'}</p>
                    <p className={`text-xs truncate ${subTextClass}`}>{currentProject?.status_label || ''}</p>
                </div>
                <svg
                    className={`h-5 w-5 shrink-0 transition-transform ${iconClass} ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="absolute left-0 right-0 mt-1 z-50 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 max-h-64 overflow-y-auto">
                        <Link
                            href={route('projects.index')}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                        >
                            <span className="text-gray-400">+</span>
                            <span>Create / Switch Project</span>
                        </Link>
                        {userProjects?.map((project) => (
                            <Link
                                key={project.id}
                                href={route('projects.show', project.id)}
                                className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 ${
                                    currentProject?.id === project.id ? 'bg-gray-50' : ''
                                }`}
                                onClick={() => setOpen(false)}
                            >
                                {project.logo ? (
                                    <img
                                        src={project.logo}
                                        alt={project.name}
                                        className="h-8 w-8 rounded object-cover shrink-0"
                                    />
                                ) : (
                                    <div
                                        className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-xs shrink-0"
                                        style={{ backgroundColor: '#3B82F6' }}
                                    >
                                        {project.name?.charAt(0) || '?'}
                                    </div>
                                )}
                                <span className="text-gray-900">{project.name}</span>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
