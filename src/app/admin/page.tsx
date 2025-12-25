'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const { jobs, applications, fetchJobs, fetchApplications } = useAppStore();

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [fetchJobs, fetchApplications]);

    const stats = [
        {
            title: 'Total Jobs',
            value: jobs.length,
            icon: Briefcase,
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Active Jobs',
            value: jobs.filter(j => j.is_active).length,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Total Applications',
            value: applications.length,
            icon: FileText,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Pending Review',
            value: applications.filter(a => a.status === 'applied').length,
            icon: Users,
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your hiring activities
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2`}>
                                    <stat.icon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {applications.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No applications yet
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {applications.slice(0, 5).map((app) => (
                                    <div
                                        key={app.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-medium">{app.applicant_name}</p>
                                            <p className="text-sm text-muted-foreground">{app.email}</p>
                                        </div>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize">
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
