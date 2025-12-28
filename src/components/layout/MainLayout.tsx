'use client';

import { ReactNode, useState } from 'react';
import { useAppStore } from '@/store';
import { Sidebar } from './Sidebar';
import { Menu, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { userRole } = useAppStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // If no user role, render minimal layout with responsive container
    if (!userRole) {
        return (
            <div className="min-h-screen bg-background">
                {/* Simple Mobile Header for unauthenticated */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white border-b px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB400]">
                            <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">HireHub</span>
                    </Link>
                </div>
                <main className="pt-14 lg:pt-0">
                    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white dark:bg-gray-900 border-b px-4 py-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB400]">
                        <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg">HireHub</span>
                </Link>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile, shown on lg */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <main className="lg:pl-64 pt-14 lg:pt-0">
                <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
