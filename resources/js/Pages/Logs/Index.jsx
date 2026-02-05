import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    IconCalendar,
    IconDocument,
    IconTag,
} from '@/Components/expense/Icons';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function LogsIndex({ project, logs, filters, filterOptions }) {
    const [selectedLog, setSelectedLog] = useState(null);
    const applyFilters = (newFilters) => {
        router.get(route('projects.modules.logs.index', project.id), newFilters, {
            preserveState: true,
        });
    };

    const selectClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
    const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

    const actionColors = {
        created: 'bg-emerald-100 text-emerald-800',
        updated: 'bg-blue-100 text-blue-800',
        deleted: 'bg-red-100 text-red-800',
        paid: 'bg-violet-100 text-violet-800',
        refunded: 'bg-amber-100 text-amber-800',
        reinstate: 'bg-emerald-100 text-emerald-800',
    };

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <IconDocument className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Activity Logs</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Audit trail of project actions</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Activity Logs`} />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">User</span>
                    <select
                        value={filters?.user_id || ''}
                        onChange={(e) => applyFilters({ ...filters, user_id: e.target.value || undefined })}
                        className={selectClass + ' max-w-[160px]'}
                    >
                        <option value="">All users</option>
                        {filterOptions?.users?.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <IconTag className="text-gray-500" />
                    <select
                        value={filters?.loggable_type || ''}
                        onChange={(e) => applyFilters({ ...filters, loggable_type: e.target.value || undefined })}
                        className={selectClass + ' max-w-[180px]'}
                    >
                        <option value="">All entities</option>
                        {filterOptions?.entity_types?.map((et) => (
                            <option key={et.value} value={et.value}>{et.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filters?.action || ''}
                        onChange={(e) => applyFilters({ ...filters, action: e.target.value || undefined })}
                        className={selectClass + ' max-w-[140px]'}
                    >
                        <option value="">All actions</option>
                        {filterOptions?.actions?.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
                <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-4">
                    <IconCalendar className="text-gray-500" />
                    <input
                        type="date"
                        value={filters?.from_date || ''}
                        onChange={(e) => applyFilters({ ...filters, from_date: e.target.value || undefined })}
                        className={inputClass + ' max-w-[140px]'}
                    />
                    <span className="text-gray-400">–</span>
                    <input
                        type="date"
                        value={filters?.to_date || ''}
                        onChange={(e) => applyFilters({ ...filters, to_date: e.target.value || undefined })}
                        className={inputClass + ' max-w-[140px]'}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {logs?.data?.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span title={log.created_at}>{log.created_at_human}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            actionColors[log.action] || 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {log.loggable_type}
                                    {log.loggable_id && (
                                        <span className="text-gray-400"> #{log.loggable_id}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                    {log.description || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {log.user?.name || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLog(log)}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        <IconDocument className="h-4 w-4" />
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!logs?.data || logs.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconDocument className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No activity logs yet.</p>
                        <p className="mt-1 text-sm">Actions in this project will appear here.</p>
                    </div>
                )}
            </div>

            {selectedLog && (
                <Modal show onClose={() => setSelectedLog(null)} maxWidth="lg">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Log Details</h3>
                        <dl className="mt-4 space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                                <dd className="mt-1 text-sm text-gray-900">{selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Action</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColors[selectedLog.action] || 'bg-gray-100 text-gray-800'}`}>
                                        {selectedLog.action}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Entity</dt>
                                <dd className="mt-1 text-sm text-gray-900">{selectedLog.loggable_type}{selectedLog.loggable_id ? ` #${selectedLog.loggable_id}` : ''}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Module</dt>
                                <dd className="mt-1 text-sm text-gray-900">{selectedLog.module || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">User</dt>
                                <dd className="mt-1 text-sm text-gray-900">{selectedLog.user?.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900">{selectedLog.description || '—'}</dd>
                            </div>
                            {selectedLog.ip_address && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ip_address}</dd>
                                </div>
                            )}
                            {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Previous Values</dt>
                                    <dd className="mt-1 rounded-lg bg-gray-50 p-3">
                                        <pre className="overflow-x-auto text-xs text-gray-700">{JSON.stringify(selectedLog.old_values, null, 2)}</pre>
                                    </dd>
                                </div>
                            )}
                            {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">New Values</dt>
                                    <dd className="mt-1 rounded-lg bg-gray-50 p-3">
                                        <pre className="overflow-x-auto text-xs text-gray-700">{JSON.stringify(selectedLog.new_values, null, 2)}</pre>
                                    </dd>
                                </div>
                            )}
                        </dl>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setSelectedLog(null)}>Close</SecondaryButton>
                        </div>
                    </div>
                </Modal>
            )}

            {logs?.meta?.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {logs.data.length} of {logs.meta.total} logs
                    </p>
                    <div className="flex gap-2">
                        {logs.links?.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-600 hover:bg-gray-100'} ${!link.url && 'pointer-events-none opacity-50'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </ProjectLayout>
    );
}
