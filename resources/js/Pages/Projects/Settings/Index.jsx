import ProjectLayout from '@/Layouts/ProjectLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function ProjectSettingsIndex({ project }) {
    const primaryColor = project?.primary_color || '#3B82F6';
    const focusClass = 'focus:border-[var(--project-primary)] focus:ring-[var(--project-primary)]';

    const projectForm = useForm({
        name: project?.name ?? '',
        description: project?.description ?? '',
        address: project?.address ?? '',
        phone: project?.phone ?? '',
        city: project?.city ?? '',
        country: project?.country ?? '',
        primary_color: project?.primary_color ?? '#3B82F6',
        secondary_color: project?.secondary_color ?? '#10B981',
        status: project?.status ?? 'active',
        logo: null,
    });

    const emailForm = useForm({
        mail_from_name: project?.mail_from_name ?? '',
        mail_from_address: project?.mail_from_address ?? '',
        smtp_driver: project?.smtp_driver ?? 'smtp',
        smtp_host: project?.smtp_host ?? '',
        smtp_port: project?.smtp_port ?? '',
        smtp_username: project?.smtp_username ?? '',
        smtp_password: project?.smtp_password ?? '',
        smtp_encryption: project?.smtp_encryption ?? 'tls',
    });

    const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;
    const selectClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${focusClass}`;

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex text-sm text-gray-500">
                            <Link href={route('projects.show', project.id)} className="hover:text-gray-700">
                                Dashboard
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium">Settings</span>
                        </nav>
                        <h2 className="mt-1 text-xl font-semibold leading-tight text-gray-800">Project Settings</h2>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Settings`} />

            <div className="space-y-8">
                {/* Project Information */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData();
                        Object.entries(projectForm.data).forEach(([k, v]) => {
                            if (k === 'logo' && v instanceof File) fd.append('logo', v);
                            else if (v != null && v !== '' && k !== 'logo') fd.append(k, v);
                        });
                        fd.append('_method', 'PATCH');
                        router.post(route('projects.settings.project.update', project.id), fd);
                    }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Basic details and contact information for this project.</p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="name" value="Project Name" />
                            <TextInput
                                id="name"
                                value={projectForm.data.name}
                                onChange={(e) => projectForm.setData('name', e.target.value)}
                                className={inputClass}
                                required
                            />
                            <InputError message={projectForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="phone" value="Phone" />
                            <TextInput
                                id="phone"
                                value={projectForm.data.phone}
                                onChange={(e) => projectForm.setData('phone', e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={projectForm.errors.phone} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                value={projectForm.data.description}
                                onChange={(e) => projectForm.setData('description', e.target.value)}
                                className={`${inputClass} min-h-[80px]`}
                                rows={3}
                            />
                            <InputError message={projectForm.errors.description} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="address" value="Address" />
                            <TextInput
                                id="address"
                                value={projectForm.data.address}
                                onChange={(e) => projectForm.setData('address', e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={projectForm.errors.address} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="city" value="City" />
                            <TextInput
                                id="city"
                                value={projectForm.data.city}
                                onChange={(e) => projectForm.setData('city', e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={projectForm.errors.city} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="country" value="Country" />
                            <TextInput
                                id="country"
                                value={projectForm.data.country}
                                onChange={(e) => projectForm.setData('country', e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={projectForm.errors.country} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="primary_color" value="Primary Color" />
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="color"
                                    id="primary_color"
                                    value={projectForm.data.primary_color}
                                    onChange={(e) => projectForm.setData('primary_color', e.target.value)}
                                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                                />
                                <TextInput
                                    value={projectForm.data.primary_color}
                                    onChange={(e) => projectForm.setData('primary_color', e.target.value)}
                                    className="block flex-1"
                                />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="secondary_color" value="Secondary Color" />
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="color"
                                    id="secondary_color"
                                    value={projectForm.data.secondary_color}
                                    onChange={(e) => projectForm.setData('secondary_color', e.target.value)}
                                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                                />
                                <TextInput
                                    value={projectForm.data.secondary_color}
                                    onChange={(e) => projectForm.setData('secondary_color', e.target.value)}
                                    className="block flex-1"
                                />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="logo" value="Logo" />
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={(e) => projectForm.setData('logo', e.target.files[0])}
                                className={inputClass}
                            />
                            {project?.logo && (
                                <p className="mt-2 text-sm text-gray-500">Current logo is set. Upload a new file to replace.</p>
                            )}
                            <InputError message={projectForm.errors.logo} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <PrimaryButton type="submit" disabled={projectForm.processing} style={{ backgroundColor: primaryColor }}>
                            Save Project Info
                        </PrimaryButton>
                        <Link href={route('projects.show', project.id)}>
                            <SecondaryButton type="button">Cancel</SecondaryButton>
                        </Link>
                    </div>
                </form>

                {/* SMTP / Email Settings */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        emailForm.patch(route('projects.settings.email.update', project.id));
                    }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <h3 className="text-lg font-medium text-gray-900">SMTP Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Configure email to send invoices from the Sales module.
                    </p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="mail_from_name" value="Sender Name" />
                            <TextInput
                                id="mail_from_name"
                                value={emailForm.data.mail_from_name}
                                onChange={(e) => emailForm.setData('mail_from_name', e.target.value)}
                                className={inputClass}
                                placeholder="e.g. Company Name"
                            />
                            <InputError message={emailForm.errors.mail_from_name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mail_from_address" value="Sender Email" />
                            <TextInput
                                id="mail_from_address"
                                type="email"
                                value={emailForm.data.mail_from_address}
                                onChange={(e) => emailForm.setData('mail_from_address', e.target.value)}
                                className={inputClass}
                                placeholder="e.g. noreply@example.com"
                            />
                            <InputError message={emailForm.errors.mail_from_address} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="smtp_driver" value="SMTP Driver" />
                            <select
                                id="smtp_driver"
                                value={emailForm.data.smtp_driver}
                                onChange={(e) => emailForm.setData('smtp_driver', e.target.value)}
                                className={selectClass}
                            >
                                <option value="smtp">smtp</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="smtp_host" value="SMTP Host" />
                            <TextInput
                                id="smtp_host"
                                value={emailForm.data.smtp_host}
                                onChange={(e) => emailForm.setData('smtp_host', e.target.value)}
                                className={inputClass}
                                placeholder="e.g. smtp.gmail.com"
                            />
                            <InputError message={emailForm.errors.smtp_host} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="smtp_username" value="SMTP Username" />
                            <TextInput
                                id="smtp_username"
                                type="email"
                                value={emailForm.data.smtp_username}
                                onChange={(e) => emailForm.setData('smtp_username', e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={emailForm.errors.smtp_username} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="smtp_password" value="SMTP Password" />
                            <TextInput
                                id="smtp_password"
                                type="password"
                                value={emailForm.data.smtp_password === '••••••••' ? '' : emailForm.data.smtp_password}
                                onChange={(e) => emailForm.setData('smtp_password', e.target.value)}
                                className={inputClass}
                                placeholder={project?.smtp_password ? 'Leave blank to keep current' : ''}
                                autoComplete="new-password"
                            />
                            <InputError message={emailForm.errors.smtp_password} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="smtp_encryption" value="SMTP Encryption" />
                            <select
                                id="smtp_encryption"
                                value={emailForm.data.smtp_encryption || 'tls'}
                                onChange={(e) => emailForm.setData('smtp_encryption', e.target.value)}
                                className={selectClass}
                            >
                                <option value="tls">tls</option>
                                <option value="ssl">ssl</option>
                                <option value="null">none</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="smtp_port" value="SMTP Port" />
                            <TextInput
                                id="smtp_port"
                                type="number"
                                min={1}
                                max={65535}
                                value={emailForm.data.smtp_port}
                                onChange={(e) => emailForm.setData('smtp_port', e.target.value ? parseInt(e.target.value, 10) : '')}
                                className={inputClass}
                                placeholder="587"
                            />
                            <InputError message={emailForm.errors.smtp_port} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <PrimaryButton type="submit" disabled={emailForm.processing} style={{ backgroundColor: primaryColor }}>
                            Save Email Settings
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </ProjectLayout>
    );
}
