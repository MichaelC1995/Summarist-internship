'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch';
import { closeModal } from '@/store/modalSlice';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { IoClose } from 'react-icons/io5';

export default function AuthModal() {
    const dispatch = useAppDispatch();
    const { isOpen, modalType } = useAppSelector((state) => state.modal);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup function
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Don't render if not open
    if (!isOpen) return null;

    // Close modal when clicking backdrop
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            dispatch(closeModal());
        }
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            {/* Modal */}
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close button */}
                <button
                    onClick={() => dispatch(closeModal())}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <IoClose size={24} />
                </button>

                {/* Content */}
                <div className="p-8">
                    {modalType === 'login' && <LoginForm />}
                    {modalType === 'register' && <RegisterForm />}
                    {modalType === 'forgotPassword' && <ForgotPasswordForm />}
                </div>
            </div>
        </div>
    );
}