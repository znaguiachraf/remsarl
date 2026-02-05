import AuthErrorHandler from '@/Components/AuthErrorHandler';
import Sidebar from '@/Components/project/Sidebar';
import Topbar from '@/Components/project/Topbar';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ProjectLayout({ header, children }) {
    const { currentProject, enabledModules, userRole, auth, userProjects } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const primaryColor = currentProject?.primary_color || '#3B82F6';
    const secondaryColor = currentProject?.secondary_color || '#10B981';

    return (
        <div
            className="min-h-screen bg-gray-50"
            style={{
                '--project-primary': primaryColor,
                '--project-secondary': secondaryColor,
            }}
        >
            <div className="flex min-h-screen">
                {/* Desktop/tablet sidebar - sticky, full height, visible from md up */}
                <div className="hidden shrink-0 md:block">
                    <div className="sticky top-0 h-screen">
                        <Sidebar
                            currentProject={currentProject}
                            enabledModules={enabledModules}
                            userRole={userRole}
                            collapsed={sidebarCollapsed}
                            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                        />
                    </div>
                </div>

                {/* Mobile sidebar - full-width drawer with safe areas */}
                <div
                    className={`fixed inset-y-0 left-0 z-40 w-[min(20rem,85vw)] max-w-full transform bg-gray-800 shadow-xl transition-transform duration-300 ease-out md:hidden ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    style={{
                        paddingTop: 'env(safe-area-inset-top)',
                        paddingBottom: 'env(safe-area-inset-bottom)',
                        paddingLeft: 'env(safe-area-inset-left)',
                    }}
                >
                    <div className="flex h-full flex-col overflow-hidden">
                        <Sidebar
                            currentProject={currentProject}
                            enabledModules={enabledModules}
                            userRole={userRole}
                            onNavigate={() => setSidebarOpen(false)}
                            variant="mobile"
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar
                        currentProject={currentProject}
                        userProjects={userProjects}
                        user={auth?.user}
                        onToggleSidebar={() => setSidebarOpen(true)}
                    />
                    <main className="flex-1">
                        {header && (
                            <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
                                <div className="mx-auto max-w-7xl">{header}</div>
                            </div>
                        )}
                        <div className="p-4 sm:p-6">{children}</div>
                    </main>
                </div>
            </div>
            <AuthErrorHandler />
        </div>
    );
}
