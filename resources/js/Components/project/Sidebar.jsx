import { Link, usePage } from '@inertiajs/react';

/** Modules with dedicated routes - use direct link instead of generic modules.show */
const moduleRouteMap = {
    analytics: (projectId) => route('projects.modules.analytics.index', projectId),
    hr: (projectId) => route('projects.modules.hr.workers.index', projectId),
    tasks: (projectId) => route('projects.modules.tasks.index', projectId),
    suppliers: (projectId) => route('projects.modules.suppliers.index', projectId),
    products: (projectId) => route('projects.modules.products.index', projectId),
    sales: (projectId) => route('projects.modules.sales.index', projectId),
    stock: (projectId) => route('projects.modules.stock.index', projectId),
    pos: (projectId) => route('projects.modules.pos.index', projectId),
    payments: (projectId) => route('projects.modules.payments.index', projectId),
    expenses: (projectId) => route('projects.modules.expenses.index', projectId),
    purchase: (projectId) => route('projects.modules.purchase.index', projectId),
    logs: (projectId) => route('projects.modules.logs.index', projectId),
};

const getModuleHref = (projectId, moduleKey) =>
    moduleRouteMap[moduleKey]?.(projectId) ?? route('projects.modules.show', [projectId, moduleKey]);

const iconPaths = {
    'shopping-cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    'check-square': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    'clipboard-list': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    'dollar-sign': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    truck: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'shopping-bag': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'view-grid': 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

function SidebarIcon({ icon }) {
    const path = iconPaths[icon] || iconPaths.folder;
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
        </svg>
    );
}

function NavItem({ href, active, icon, children, onNavigate, isMobile, collapsed, badge = 0 }) {
    return (
        <Link
            href={href}
            onClick={() => onNavigate?.()}
            title={collapsed ? children : undefined}
            className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 font-medium transition-colors ${
                isMobile ? 'py-3.5 text-base' : 'py-2.5 text-sm'
            } ${collapsed ? 'justify-center px-2' : ''} ${
                active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white active:bg-white/15'
            }`}
        >
            <span className="relative shrink-0">
                <SidebarIcon icon={icon} />
                {badge > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white/90 px-1 text-[10px] font-semibold text-gray-800">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </span>
            {!collapsed && children}
        </Link>
    );
}

export default function Sidebar({
    currentProject,
    enabledModules,
    userRole,
    onNavigate,
    onClose,
    collapsed = false,
    onToggleCollapse,
    className = '',
    variant = 'desktop',
}) {
    const { url, props } = usePage();
    const projectId = currentProject?.id;
    const notificationCounts = props?.notificationCounts ?? {};
    const sidebar = props?.sidebar ?? {};
    const visibleModules = sidebar.visibleModules ?? [];
    const canSeeNotes = sidebar.canSeeNotes ?? false;
    const canSeeWorkers = sidebar.canSeeWorkers ?? false;
    const canSeeRoles = sidebar.canSeeRoles ?? false;

    if (!projectId) return null;

    const isActive = (path) => url.startsWith(path);
    const isMobile = variant === 'mobile';
    const isCollapsed = !isMobile && collapsed;

    const primary = currentProject?.primary_color || '#3B82F6';
    const secondary = currentProject?.secondary_color || '#10B981';
    const gradientStyle = {
        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    };

    const handleToggle = () => {
        if (isMobile) {
            onClose?.();
        } else {
            onToggleCollapse?.();
        }
    };

    return (
        <aside
            className={`flex h-full shrink-0 flex-col transition-[width] duration-200 ${isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-64'} ${className}`}
            style={isMobile ? { ...gradientStyle, overscrollBehavior: 'contain' } : gradientStyle}
        >
            <div className={`flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 ${isMobile ? 'h-14 min-h-[3.5rem]' : 'h-16'} ${isCollapsed ? 'px-2' : 'px-4'}`}>
                <div className={`flex min-w-0 flex-1 items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    {currentProject?.logo ? (
                        <img
                            src={currentProject.logo}
                            alt={currentProject.name}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <div
                            className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-white/25 backdrop-blur-sm"
                        >
                            {currentProject?.name?.charAt(0)}
                        </div>
                    )}
                    {!isCollapsed && <span className="font-semibold text-white truncate">{currentProject?.name}</span>}
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
                    aria-label={isMobile ? 'Close menu' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={isMobile ? 'Close menu' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isMobile ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : isCollapsed ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    )}
                </button>
            </div>

            <nav
                className={`flex-1 space-y-0.5 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-3'} ${isMobile ? 'overflow-x-hidden overscroll-contain pb-6' : ''}`}
                style={isMobile ? { WebkitOverflowScrolling: 'touch' } : undefined}
            >
                <NavItem
                    href={route('projects.show', projectId)}
                    active={url === route('projects.show', projectId)}
                    icon="view-grid"
                    onNavigate={onNavigate}
                    isMobile={isMobile}
                    collapsed={isCollapsed}
                >
                    Dashboard
                </NavItem>

                {visibleModules.map((module) => (
                    <NavItem
                        key={module.key}
                        href={getModuleHref(projectId, module.key)}
                        active={isActive(getModuleHref(projectId, module.key))}
                        icon={module.icon}
                        onNavigate={onNavigate}
                        isMobile={isMobile}
                        collapsed={isCollapsed}
                        badge={module.key === 'tasks' ? (notificationCounts?.tasks ?? 0) : 0}
                    >
                        {module.name}
                    </NavItem>
                ))}

                <div className={`border-t border-white/10 ${isMobile ? 'my-3' : 'my-4'}`} />

                {canSeeNotes && (
                    <NavItem
                        href={route('projects.notes.index', projectId)}
                        active={isActive(`/projects/${projectId}/notes`)}
                        icon="file-text"
                        onNavigate={onNavigate}
                        isMobile={isMobile}
                        collapsed={isCollapsed}
                    >
                        Employee Notes
                    </NavItem>
                )}

                {canSeeWorkers && (
                    <NavItem
                        href={route('projects.workers.index', projectId)}
                        active={isActive(`/projects/${projectId}/workers`)}
                        icon="users"
                        onNavigate={onNavigate}
                        isMobile={isMobile}
                        collapsed={isCollapsed}
                    >
                        Workers
                    </NavItem>
                )}

                {canSeeRoles && (
                    <NavItem
                        href={route('projects.roles.index', projectId)}
                        active={isActive(`/projects/${projectId}/roles`)}
                        icon="shield"
                        onNavigate={onNavigate}
                        isMobile={isMobile}
                        collapsed={isCollapsed}
                    >
                        Roles & Permissions
                    </NavItem>
                )}

                {props?.currentProject?.can_update && (
                    <NavItem
                        href={route('projects.settings.index', projectId)}
                        active={isActive(`/projects/${projectId}/settings`)}
                        icon="cog"
                        onNavigate={onNavigate}
                        isMobile={isMobile}
                        collapsed={isCollapsed}
                    >
                        Settings
                    </NavItem>
                )}
            </nav>
        </aside>
    );
}
