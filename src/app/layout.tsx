import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/providers/ReduxProvider';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Summarist - Book Summaries',
    description: 'Get key insights from the world\'s best books in 15 minutes',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <ReduxProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ReduxProvider>
        </body>
        </html>
    );
}