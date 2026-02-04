import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthErrorHandler from '@/Components/AuthErrorHandler';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-1 items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                            <div className="hidden space-x-8 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                {usePage().props.auth?.user?.is_admin && (
                                    <NavLink
                                        href={route('admin.dashboard')}
                                        active={route().current()?.startsWith('admin.')}
                                    >
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden items-center sm:flex">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-lg">
                                        <button
                                            type="button"
                                            className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none"
                                        >
                                            {user.name}
                                            <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                                aria-label="Toggle navigation"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    {!showingNavigationDropdown ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div className="px-4 pb-4 pt-2 sm:hidden">
                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                Dashboard
                            </ResponsiveNavLink>
                            {usePage().props.auth?.user?.is_admin && (
                                <ResponsiveNavLink
                                    href={route('admin.dashboard')}
                                    active={route().current()?.startsWith('admin.')}
                                >
                                    Admin
                                </ResponsiveNavLink>
                            )}
                        </div>

                        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-base font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
            <AuthErrorHandler />
        </div>
    );
}
