export default function StatusBadge({ status, size = 'md' }) {
    const variants = {
        active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        suspended: 'bg-amber-100 text-amber-800 border-amber-200',
        archived: 'bg-slate-100 text-slate-600 border-slate-200',
        pending: 'bg-blue-100 text-blue-800 border-blue-200',
        inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const labels = {
        active: 'Active',
        suspended: 'Suspended',
        archived: 'Archived',
        pending: 'Pending',
        inactive: 'Inactive',
    };

    const style = variants[status] || variants.inactive;

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border ${style} ${sizes[size]}`}
        >
            {labels[status] || status}
        </span>
    );
}
