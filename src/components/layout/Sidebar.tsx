'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Briefcase,
    Users,
    LogOut,
    LayoutDashboard,
    FileText,
    User,
    Moon,
    Sun,
} from 'lucide-react';

interface SidebarProps {
    onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { userRole, setUserRole } = useAppStore();
    const [isDark, setIsDark] = useState(true);

    // Initialize dark mode from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('hirehub-dark-mode');
            const prefersDark = saved === null
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                : saved === 'true';
            setIsDark(prefersDark);
            document.documentElement.classList.toggle('dark', prefersDark);
        }
    }, []);

    const toggleDarkMode = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        document.documentElement.classList.toggle('dark', newValue);
        localStorage.setItem('hirehub-dark-mode', String(newValue));
    };

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/jobs', label: 'Job List', icon: Briefcase },
        { href: '/admin/candidates', label: 'Manage Candidates', icon: Users },
    ];

    const applicantLinks = [
        { href: '/jobs', label: 'Job List', icon: Briefcase },
        { href: '/applications', label: 'My Applications', icon: FileText },
    ];

    const links = userRole === 'admin' ? adminLinks : applicantLinks;

    const handleSignOut = () => {
        setUserRole(null);
        localStorage.removeItem('hirehub_user');
        router.push('/');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#1D1F20] border-r border-[#3A3D3F]">
            <div className="flex h-full flex-col">
                {/* Logo / Brand */}
                <div className="flex h-16 items-center border-b border-[#3A3D3F] px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFB400]">
                            <Briefcase className="h-5 w-5 text-[#1D1F20]" />
                        </div>
                        <span className="font-heading text-lg font-bold text-white">HireHub</span>
                    </Link>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-4">
                    <div className="rounded-lg bg-[#2A2D2F] px-3 py-2.5 text-sm">
                        <span className="text-gray-500">Mode:</span>
                        <span className="ml-2 font-semibold text-[#FFB400] capitalize">
                            {userRole === 'admin' ? 'Admin' : 'Applicant'}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3">
                    {links.map((link) => {
                        const isActive = pathname === link.href ||
                            (link.href !== '/admin' && link.href !== '/jobs' && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onNavigate}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-[#FFB400] text-[#1D1F20]'
                                        : 'text-gray-400 hover:bg-[#2A2D2F] hover:text-white'
                                )}
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        );
                    })}

                    {/* Profile Link */}
                    <Link
                        href="/profile"
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            pathname === '/profile'
                                ? 'bg-[#FFB400] text-[#1D1F20]'
                                : 'text-gray-400 hover:bg-[#2A2D2F] hover:text-white'
                        )}
                    >
                        <User className="h-5 w-5" />
                        Profile
                    </Link>
                </nav>

                {/* Dark Mode Toggle & Sign Out */}
                <div className="border-t border-[#3A3D3F] p-4 space-y-2">
                    {/* Dark Mode Toggle */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-[#2A2D2F]"
                        onClick={toggleDarkMode}
                    >
                        {isDark ? (
                            <>
                                <Sun className="h-5 w-5" />
                                Light Mode
                            </>
                        ) : (
                            <>
                                <Moon className="h-5 w-5" />
                                Dark Mode
                            </>
                        )}
                    </Button>

                    {/* Sign Out */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-[#2A2D2F]"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-5 w-5" />
                        Keluar
                    </Button>
                </div>
            </div>
        </aside>
    );
}
