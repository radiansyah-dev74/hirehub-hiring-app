'use client';

import { ReactNode } from 'react';
import { useAppStore } from '@/store';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { userRole } = useAppStore();

    if (!userRole) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="pl-64">
                <div className="container mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
