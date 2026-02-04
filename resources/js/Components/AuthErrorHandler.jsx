import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthorizationErrorModal from '@/Components/AuthorizationErrorModal';

/**
 * Displays the authorization error modal when a 403 occurs.
 * Must be rendered inside Inertia context (e.g. within a layout).
 */
export default function AuthErrorHandler() {
    const { auth_error } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (auth_error) {
            setMessage(typeof auth_error === 'string' ? auth_error : 'You are not authorized to perform this action.');
            setShowModal(true);
        }
    }, [auth_error]);

    const handleClose = () => {
        setShowModal(false);
        setMessage('');
    };

    return (
        <AuthorizationErrorModal
            show={showModal}
            message={message}
            onClose={handleClose}
        />
    );
}
