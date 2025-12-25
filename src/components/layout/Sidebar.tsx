'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Briefcase,
    Users,
    LogOut,
    LayoutDashboard,
    FileText,
} from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const { userRole, setUserRole } = useAppStore();

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
        { href: '/admin/candidates', label: 'Candidates', icon: Users },
    ];

    const applicantLinks = [
        { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
        { href: '/applications', label: 'My Applications', icon: FileText },
    ];

    const links = userRole === 'admin' ? adminLinks : applicantLinks;

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
            <div className="flex h-full flex-col">
                {/* Logo / Brand */}
                <div className="flex h-16 items-center border-b border-border px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-semibold">HireHub</span>
                    </Link>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3">
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Logged in as:</span>
                        <span className="ml-2 font-medium capitalize">{userRole || 'Guest'}</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="border-t border-border p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground"
                        onClick={() => setUserRole(null)}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </aside>
    );
}
