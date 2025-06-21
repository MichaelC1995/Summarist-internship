'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { switchModal } from '@/store/modalSlice';

export default function ForgotPasswordForm() {
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                setError('No user found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full text-center">
                <h2 className="text-2xl text-black font-bold mb-4">Check your email</h2>
                <p className="text-gray-600 mb-6">
                    We've sent a password reset link to {email}
                </p>
                <button
                    onClick={() => dispatch(switchModal('login'))}
                    className="text-green-500 hover:text-green-600 font-medium"
                >
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl text-black font-bold text-center mb-6">Reset your password</h2>
            <p className="text-black text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send reset link'}
                </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
                Remember your password?{' '}
                <button
                    onClick={() => dispatch(switchModal('login'))}
                    className="text-green-500 hover:text-green-600 font-medium"
                >
                    Login
                </button>
            </p>
        </div>
    );
}