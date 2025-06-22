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
            await signInWithEmailAndPassword(auth, email, password);
            dispatch(closeModal());

            if (intendedDestination) {
                router.push(intendedDestination);
                dispatch(clearIntendedDestination());
            } else {
                router.push('/for-you');
            }
        } catch (error: any) {
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password.');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many attempts. Please try again later.');
                    break;
                default:
                    setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, 'guest@gmail.com', 'guest123');
            dispatch(closeModal());

            if (intendedDestination) {
                router.push(intendedDestination);
                dispatch(clearIntendedDestination());
            } else {
                router.push('/for-you');
            }
        } catch (error) {
            setError('Guest login unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl text-black font-bold text-center mb-6">Log in to Summarist</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
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

            <form onSubmit={handleSubmit} className="space-y-4 ">
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                Don't have an account?{' '}
            </button>
        </div>
    );
}