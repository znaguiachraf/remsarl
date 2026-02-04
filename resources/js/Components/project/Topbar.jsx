import Dropdown from '@/Components/Dropdown';
import ProjectSwitcher from '@/Components/project/ProjectSwitcher';
import { Link } from '@inertiajs/react';

export default function Topbar({
    currentProject,
    userProjects,
    user,
    onToggleSidebar = () => {},
}) {
    return (
        <header className="sticky top-0 z-30 flex min-h-[4.25rem] flex-wrap items-center gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/75 sm:px-6">
            <button
                type="button"
                onClick={onToggleSidebar}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 md:hidden"
                aria-label="Open navigation"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <ProjectSwitcher currentProject={currentProject} userProjects={userProjects} />

            <div className="flex-1" />

            <div className="flex items-center gap-3 text-sm">
                <Link href={route('projects.index')} className="rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900">
                    All Projects
                </Link>

                <Dropdown>
                    <Dropdown.Trigger>
                        <span className="inline-flex w-full rounded-lg">
                            <button
                                type="button"
                                className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none"
                            >
                                {user?.name}
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
        </header>
    );
}
