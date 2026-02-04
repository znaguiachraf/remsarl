import AuthErrorHandler from '@/Components/AuthErrorHandler';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ header, children }) {
    const { url } = usePage();

    const navItems = [
        { href: route('admin.dashboard'), label: 'Dashboard' },
        { href: route('admin.workers.index'), label: 'Workers' },
        { href: route('admin.permissions.index'), label: 'Permissions' },
        { href: route('admin.roles.index'), label: 'Roles' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <Link href={route('admin.dashboard')} className="flex shrink-0 items-center">
                                <span className="text-xl font-bold text-gray-800">Admin</span>
                            </Link>
                            <div className="ml-8 flex space-x-4">
                                {navItems.map((item) => {
                                    const path = item.href.startsWith('http') ? new URL(item.href).pathname : item.href;
                                    const isActive = url === path || (path !== '/admin' && url.startsWith(path + '/'));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`inline-flex items-center border-b-2 px-1 pt-4 text-sm font-medium ${
                                                isActive
                                                    ? 'border-indigo-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Link
                                href={route('projects.index')}
                                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                                ← Back to Projects
                            </Link>
                        </div>
                    </div>
                </div>
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
