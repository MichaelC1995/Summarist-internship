'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { closeModal, switchModal } from '@/store/modalSlice';
import { clearIntendedDestination } from '@/store/authSlice';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const intendedDestination = useAppSelector((state) => state.auth.intendedDestination);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: null,
                photoURL: null,
                isSubscribed: false,
                subscriptionType: 'basic',
                createdAt: new Date(),
            });

            dispatch(closeModal());

            if (intendedDestination) {
                router.push(intendedDestination);
                dispatch(clearIntendedDestination());
            } else {
                router.push('/for-you');
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string };
            if (firebaseError.code === 'auth/email-already-in-use') {
                setFormError('Email already in use. Please login instead.');
            } else if (firebaseError.code === 'auth/weak-password') {
                setFormError('Password should be at least 6 characters.');
            } else if (firebaseError.code === 'auth/invalid-email') {
                setFormError('Invalid email address.');
            } else {
                setFormError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-black text-center mb-6">Sign up for Summarist</h2>

            {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                    {formError}
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-sm text-black">or</span>
                <div className="flex-1 h-px bg-gray-300" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Sign up'}
                </button>
            </form>

            <p className="text-center text-black mt-6">
                Already have an account?{' '}
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