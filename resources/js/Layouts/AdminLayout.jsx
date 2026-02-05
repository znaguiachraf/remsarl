import AdminIcon from '@/Components/AdminIcon';
import AuthErrorHandler from '@/Components/AuthErrorHandler';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLayout({ header, children }) {
    const { url } = usePage();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [desktopNavOpen, setDesktopNavOpen] = useState(true);

    const navItems = [
        { href: route('admin.dashboard'), label: 'Dashboard', icon: 'dashboard' },
        { href: route('admin.users.index'), label: 'Users', icon: 'users' },
        { href: route('admin.workers.index'), label: 'Workers', icon: 'workers' },
        { href: route('admin.modules.index'), label: 'Modules', icon: 'modules' },
        { href: route('admin.permissions.index'), label: 'Permissions', icon: 'permissions' },
        { href: route('admin.roles.index'), label: 'Roles', icon: 'roles' },
    ];

    const NavLinkItem = ({ item, isMobile = false }) => {
        const path = item.href.startsWith('http') ? new URL(item.href).pathname : item.href;
        const isActive = url === path || (path !== '/admin' && url.startsWith(path + '/'));
        return (
            <Link
                href={item.href}
                onClick={() => isMobile && setMobileNavOpen(false)}
                className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isMobile ? 'py-3.5 text-base' : ''
                } ${
                    isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${isMobile ? 'border-b border-gray-100 last:border-0' : ''}`}
            >
                <AdminIcon icon={item.icon} className={isMobile ? 'w-6 h-6' : 'w-5 h-5'} />
                {item.label}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="relative border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 md:hidden"
                                aria-label="Open menu"
                            >
                                {mobileNavOpen ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>

                            <Link href={route('admin.dashboard')} className="flex shrink-0 items-center gap-2">
                                <AdminIcon icon="dashboard" className="w-6 h-6 text-indigo-600" />
                                <span className="text-xl font-bold text-gray-800">Admin</span>
                            </Link>

                            {/* Desktop nav - toggle + links */}
                            <div className="ml-4 hidden md:flex md:items-center md:gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDesktopNavOpen(!desktopNavOpen)}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                                    aria-label={desktopNavOpen ? 'Collapse navigation' : 'Expand navigation'}
                                    title={desktopNavOpen ? 'Collapse menu' : 'Expand menu'}
                                >
                                    {desktopNavOpen ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                                {desktopNavOpen && (
                                    <div className="flex space-x-1">
                                        {navItems.map((item) => (
                                            <NavLinkItem key={item.href} item={item} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Link
                                href={route('projects.index')}
                                className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                                <AdminIcon icon="back" className="w-5 h-5" />
                                <span className="hidden sm:inline">Back to Projects</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile nav drawer */}
                {mobileNavOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30 bg-black/50 md:hidden"
                            onClick={() => setMobileNavOpen(false)}
                            aria-hidden="true"
                        />
                        <div
                            className="absolute left-4 right-4 top-full z-40 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg md:hidden"
                            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                        >
                            <div className="max-h-[70vh] overflow-y-auto py-2">
                                {navItems.map((item) => (
                                    <div key={item.href} className="px-2">
                                        <NavLinkItem item={item} isMobile />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <AuthErrorHandler />
        </div>
    );
}
