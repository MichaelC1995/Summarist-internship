'use client';

import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';

export default function AuthProvider({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <>
            {children}
            <AuthModal />
        </>
    );
}