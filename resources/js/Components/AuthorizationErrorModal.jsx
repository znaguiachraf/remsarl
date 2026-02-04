import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function AuthorizationErrorModal({ show = false, message = 'You are not authorized to perform this action.', onClose }) {
    const handleClose = () => {
        onClose?.();
    };

    return (
        <Modal show={show} onClose={handleClose} closeable={true} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Authorization Required
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={handleClose}>
                        OK
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
