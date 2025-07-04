'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { openModal } from '@/store/modalSlice';
import { setIntendedDestination } from '@/store/authSlice';
import { IoDiamondOutline } from 'react-icons/io5';
import Image from 'next/image';
import SettingsSkeleton from "@/components/books/SettingsSkeleton";

export default function SettingsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, loading } = useAuth();

    const [showSkeleton, setShowSkeleton] = useState(true);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setShowSkeleton(false);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading || showSkeleton) {
        return <SettingsSkeleton />;
    }

    if (!user) {
        return (
            <div className="w-full min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <hr className="mt-4 border-gray-200" />
                </div>

                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="w-full max-w-md mx-auto mb-6">
                            <Image
                                src="/login.png"
                                width={400}
                                height={300}
                                alt="Login required"
                                className="w-full h-auto object-contain"
                                style={{ mixBlendMode: 'multiply' }}
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Log in to your account to see your settings
                        </h2>
                        <button
                            onClick={() => {
                                dispatch(setIntendedDestination('/settings'));
                                dispatch(openModal('login'));
                            }}
                            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getSubscriptionBadge = () => {
        switch (user.subscriptionType) {
            case 'premium':
                return (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        <IoDiamondOutline size={16} />
                        Premium
                    </span>
                );
            case 'premium-plus':
                return (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <IoDiamondOutline size={16} />
                        Premium Plus
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        Basic
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
                <hr className="mb-8 border-gray-200" />

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
                        {getSubscriptionBadge()}
                    </div>

                    <div className="space-y-4">
                        {user.subscriptionType === 'basic' ? (
                            <>
                                <p className="text-gray-600">
                                    Basic plan with limited access to book summaries.
                                </p>
                                <button
                                    onClick={() => router.push('/choose-plan')}
                                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
                                >
                                    Upgrade to Premium
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plan</span>
                                        <span className="font-medium text-gray-900">
                                            {user.subscriptionType === 'premium' ? 'Premium' : 'Premium Plus'}
                                        </span>
                                    </div>
                                    {user.subscriptionStatus && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status</span>
                                            <span className={`font-medium ${
                                                user.subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {user.subscriptionType === 'premium' && (
                                    <button
                                        onClick={() => router.push('/choose-plan')}
                                        className="text-green-500 hover:text-green-600 font-medium"
                                    >
                                        Upgrade to Premium Plus →
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Email</h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'Profile'}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-medium text-gray-600">
                                        {user.email?.[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}