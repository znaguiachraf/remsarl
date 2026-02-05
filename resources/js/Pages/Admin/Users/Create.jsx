import AdminIcon from '@/Components/AdminIcon';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function UserCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2">
                        <AdminIcon icon="users" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
                </div>
            }
        >
            <Head title="Create User - Admin" />

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} />
                </div>
                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <input
                        type="password"
                        id="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        minLength={8}
                    />
                    <p className="mt-1 text-sm text-gray-500">Minimum 8 characters.</p>
                    <InputError message={errors.password} />
                </div>
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <input
                        type="password"
                        id="password_confirmation"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>
                <div className="flex gap-3">
                    <PrimaryButton type="submit" disabled={processing}>
                        Create User
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => window.history.back()}>
                        Cancel
                    </SecondaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
