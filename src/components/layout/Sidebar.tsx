'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { openModal } from '@/store/modalSlice';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    IoHomeOutline,
    IoBookmarkOutline,
    IoPencilOutline,
    IoSearchOutline,
    IoSettingsOutline,
    IoHelpCircleOutline,
    IoLogOutOutline,
    IoLogInOutline,
    IoMenuOutline,
    IoCloseOutline
} from 'react-icons/io5';
import Image from "next/image";

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    action?: () => void;
    disabled?: boolean;
}

export default function Sidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navItems: NavItem[] = [
        {
            label: 'For you',
            href: '/for-you',
            icon: <IoHomeOutline size={24} />,
        },
        {
            label: 'My Library',
            href: '/library',
            icon: <IoBookmarkOutline size={24} />,
        },
        {
            label: 'Highlights',
            icon: <IoPencilOutline size={24} />,
            disabled: true,
        },
        {
            label: 'Search',
            icon: <IoSearchOutline size={24} />,
            disabled: true,
        },
    ];

    const bottomNavItems: NavItem[] = [
        {
            label: 'Settings',
            href: '/settings',
            icon: <IoSettingsOutline size={24} />,
        },
        {
            label: 'Help & Support',
            icon: <IoHelpCircleOutline size={24} />,
            disabled: true,
        },
        user ? {
            label: 'Logout',
            icon: <IoLogOutOutline size={24} />,
            action: handleLogout,
        } : {
            label: 'Login',
            icon: <IoLogInOutline size={24} />,
            action: () => dispatch(openModal('login')),
        },
    ];

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = item.href === pathname;
        const isDisabled = item.disabled;

        const baseClasses = "flex items-center gap-3 px-5 py-3 text-gray-700 transition-all duration-200";
        const activeClasses = isActive ? "bg-green-50 text-green-600 border-r-4 border-green-600" : "hover:bg-gray-100";
        const disabledClasses = isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer";

        if (item.action) {
            return (
                <button
                    onClick={item.action}
                    className={`${baseClasses} ${activeClasses} ${disabledClasses} w-full text-left`}
                    disabled={isDisabled}
                >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </button>
            );
        }

        if (isDisabled || !item.href) {
            return (
                <div className={`${baseClasses} ${disabledClasses}`}>
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </div>
            );
        }

        return (
            <Link
                href={item.href}
                className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
                onClick={() => setIsMobileOpen(false)}
            >
                {item.icon}
                <span className="font-medium">{item.label}</span>
            </Link>
        );
    };

    return (
        <>
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden"
            >
                <IoMenuOutline size={24} />
            </button>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full bg-[#f1f6f4]">
                    <div className="p-5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center">
                                <Image
                                    src="/logo.png"
                                    alt="Summarist Logo"
                                    width={200}
                                    height={100}
                                    className="object-contain"
                                />
                            </Link>

                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-1 md:hidden"
                            >
                                <IoCloseOutline size={24} />
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1 py-4">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink key={item.label} item={item} />
                            ))}
                        </div>
                    </nav>

                    <div className="border-t border-gray-200 py-4">
                        <div className="space-y-1">
                            {bottomNavItems.map((item) => (
                                <NavLink key={item.label} item={item} />
                            ))}
                        </div>
                    </div>

                    {user && (
                        <div className="p-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {user.email?.[0].toUpperCase()}
                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.email}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.subscriptionType === 'basic' ? 'Basic Plan' :
                                            user.subscriptionType === 'premium' ? 'Premium' : 'Premium Plus'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}