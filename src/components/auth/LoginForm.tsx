'use client';

import {useState} from 'react';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '@/lib/firebase';
import {useAppDispatch, useAppSelector} from '@/hooks/useAppDispatch';
import {closeModal, switchModal} from '@/store/modalSlice';
import {clearIntendedDestination} from '@/store/authSlice';
import {useRouter} from 'next/navigation';

export default function LoginForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const intendedDestination = useAppSelector((state) => state.auth.intendedDestination);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (userCredential.user) {
                const destination = intendedDestination || '/for-you';

                if (intendedDestination) {
                    dispatch(clearIntendedDestination());
                }

                dispatch(closeModal());

                setTimeout(() => {
                    router.push(destination);
                }, 500);
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string };
            console.error('Login error:', firebaseError.code, firebaseError.message);

            switch (firebaseError.code) {
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                case 'auth/user-disabled':
                    setError('This account has been disabled.');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Invalid email or password. Please try again.');
                    break;
                case 'auth/missing-password':
                    setError('Please enter your password.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Please try again later.');
                    break;
                case 'auth/network-request-failed':
                    setError('Network error. Please check your connection.');
                    break;
                default:
                    setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, 'guest@gmail.com', 'guest123');

            if (userCredential.user) {
                const destination = intendedDestination || '/for-you';

                if (intendedDestination) {
                    dispatch(clearIntendedDestination());
                }

                dispatch(closeModal());

                setTimeout(() => {
                    router.push(destination);
                }, 500);
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string };
            console.error('Guest login error:', firebaseError.code, firebaseError.message);
            setError('Guest login unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl text-black font-bold text-center mb-6">Log in to Summarist</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors mb-4 disabled:opacity-50"
            >
                {loading ? 'Logging in...' : 'Login as Guest'}
            </button>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-300"/>
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-300"/>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoComplete="email"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoComplete="current-password"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <button
                onClick={() => dispatch(switchModal('forgotPassword'))}
                className="w-full text-center text-blue-500 hover:text-black mt-4 text-sm cursor-pointer"
            >
                Forgot your password?
            </button>

            <button
                onClick={() => dispatch(switchModal('register'))}
                className="text-blue-500 hover:text-black bg-gray-300 font-medium w-full text-center p-4 mt-4 cursor-pointer"
            >
                Don&apos;t have an account?
            </button>
        </div>
    );
}