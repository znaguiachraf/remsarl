import { Head, Link } from '@inertiajs/react';

const features = [
    {
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
        ),
        title: 'Projects',
        description: 'Organize your business into projects. Each project has its own team, modules, and data.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: 'Team & Workers',
        description: 'Assign roles and manage your team. Control access with granular permissions per project.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
        title: 'Sales & POS',
        description: 'Process sales, manage orders, and track revenue. Point-of-sale ready for your business.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        title: 'Stock & Products',
        description: 'Track inventory, manage product categories, and monitor stock movements in real time.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Payments',
        description: 'Record payments, refunds, and track cash flow. Full payment history at a glance.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        title: 'Expenses',
        description: 'Categorize and track expenses. Keep your budget under control with detailed reports.',
    },
];

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-[#f5f5f7] font-sans antialiased">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold text-[#1d1d1f]">REMSARL</span>
                        </div>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-[#007AFF] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0056b3] active:scale-[0.98]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-full px-5 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-black/5"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="rounded-full bg-[#007AFF] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0056b3] active:scale-[0.98]"
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <main className="relative pt-24 pb-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] sm:text-5xl lg:text-6xl">
                                Manage your projects.
                                <br />
                                <span className="text-[#007AFF]">Simply.</span>
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-[#86868b] sm:text-xl">
                                An all-in-one platform for projects, sales, stock, payments, and expenses. 
                                Organize your business with clarity and control.
                            </p>
                            {!auth.user && (
                                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-8 py-4 text-base font-medium text-white shadow-lg shadow-[#007AFF]/25 transition-all hover:bg-[#0056b3] hover:shadow-xl hover:shadow-[#007AFF]/30 active:scale-[0.98]"
                                    >
                                        Create free account
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-8 py-4 text-base font-medium text-[#1d1d1f] transition-all hover:border-[#007AFF] hover:text-[#007AFF] active:scale-[0.98]"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Feature cards */}
                        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] transition-colors group-hover:bg-[#007AFF]/15">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold text-[#1d1d1f]">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-[#86868b]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        {!auth.user && (
                            <div className="mt-24 rounded-3xl bg-[#1d1d1f] px-8 py-16 text-center sm:px-16">
                                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                                    Ready to get started?
                                </h2>
                                <p className="mt-3 text-base text-white/70">
                                    Join and start managing your projects in minutes.
                                </p>
                                <Link
                                    href={route('login')}
                                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-[#1d1d1f] transition-all hover:bg-gray-100 active:scale-[0.98]"
                                >
                                    Create account
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-black/5 bg-white/50 py-8">
                    <div className="mx-auto max-w-6xl px-6 text-center">
                        <p className="text-sm text-[#86868b]">
                            REMSARL — Bangicode.ma
                            <span className="mx-2">·</span>

                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
