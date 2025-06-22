'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoCheckmarkCircle } from 'react-icons/io5';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/for-you');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <IoCheckmarkCircle className="text-green-500 w-24 h-24 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Payment Successful!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Welcome to Summarist Premium
                </p>
                <p className="text-gray-500">
                    Redirecting you to your library...
                </p>
            </div>
        </div>
    );
}