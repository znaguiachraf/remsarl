import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthErrorHandler from '@/Components/AuthErrorHandler';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 px-4 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="mt-6 w-full max-w-md overflow-hidden rounded-2xl bg-white px-6 py-5 shadow-md sm:px-8">
                {children}
            </div>
            <AuthErrorHandler />
        </div>
    );
}
