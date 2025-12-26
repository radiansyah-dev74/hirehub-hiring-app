'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, FileText, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
    const { jobs, applications, fetchJobs, fetchApplications } = useAppStore();

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [fetchJobs, fetchApplications]);

    const activeJobs = jobs.filter(j => j.is_active).length;
    const pendingApplications = applications.filter(a => a.status === 'applied').length;
    const interviewApplications = applications.filter(a => a.status === 'interview').length;

    const stats = [
        {
            title: 'Total Jobs',
            value: jobs.length,
            icon: Briefcase,
            bgColor: 'bg-[#FFB400]/10',
            iconColor: 'text-[#FFB400]',
        },
        {
            title: 'Active Jobs',
            value: activeJobs,
            icon: TrendingUp,
            bgColor: 'bg-green-500/10',
            iconColor: 'text-green-500',
        },
        {
            title: 'Total Applications',
            value: applications.length,
            icon: FileText,
            bgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
        },
        {
            title: 'Pending Review',
            value: pendingApplications,
            icon: Users,
            bgColor: 'bg-orange-500/10',
            iconColor: 'text-orange-500',
        },
    ];

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'applied':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Applied</Badge>;
            case 'interview':
                return <Badge className="bg-[#FFB400]/10 text-[#FFB400] border-[#FFB400]/20">In-review</Badge>;
            case 'hired':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Hired</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Overview of your hiring activities
                        </p>
                    </div>
                    <Link href="/admin/jobs/new">
                        <Button className="gap-2 bg-[#FFB400] text-[#1D1F20] hover:bg-[#E5A300] font-semibold">
                            <Plus className="h-4 w-4" />
                            Add New Job
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="border-border">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`rounded-xl ${stat.bgColor} p-3`}>
                                        <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Applications */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
                            <Link href="/admin/candidates">
                                <Button variant="ghost" size="sm" className="gap-1 text-[#FFB400] hover:text-[#E5A300]">
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {applications.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No applications yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {applications.slice(0, 4).map((app) => {
                                        const job = jobs.find(j => j.id === app.job_id);
                                        return (
                                            <div
                                                key={app.id}
                                                className="flex items-center justify-between rounded-lg border border-border p-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium truncate">{app.applicant_name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {job?.title || 'Unknown Job'}
                                                    </p>
                                                </div>
                                                {getStatusBadge(app.status)}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Job Summary */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-semibold">Active Jobs</CardTitle>
                            <Link href="/admin/jobs">
                                <Button variant="ghost" size="sm" className="gap-1 text-[#FFB400] hover:text-[#E5A300]">
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {jobs.filter(j => j.is_active).length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-3">No active jobs</p>
                                    <Link href="/admin/jobs/new">
                                        <Button size="sm" className="bg-[#FFB400] text-[#1D1F20] hover:bg-[#E5A300]">
                                            Create Job
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {jobs.filter(j => j.is_active).slice(0, 4).map((job) => {
                                        const appCount = applications.filter(a => a.job_id === job.id).length;
                                        return (
                                            <div
                                                key={job.id}
                                                className="flex items-center justify-between rounded-lg border border-border p-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium truncate">{job.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {job.department || 'No department'}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="shrink-0">
                                                    {appCount} applicant{appCount !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
