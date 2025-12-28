'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Briefcase,
    Calendar,
    Building,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRight
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

export default function ApplicationsPage() {
    const { applications, jobs, fetchApplications, fetchJobs } = useAppStore();

    useEffect(() => {
        fetchApplications();
        fetchJobs();
    }, [fetchApplications, fetchJobs]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'hired':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'interview':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'hired':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'applied':
                return 'Pending Review';
            case 'interview':
                return 'Interview Scheduled';
            case 'hired':
                return 'Accepted!';
            case 'rejected':
                return 'Not Selected';
            default:
                return status;
        }
    };

    // Group applications by status
    const groupedApplications = {
        active: applications.filter(app => ['applied', 'interview'].includes(app.status)),
        completed: applications.filter(app => ['hired', 'rejected'].includes(app.status)),
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">My Applications</h1>
                        <p className="text-sm text-muted-foreground">
                            Track the status of your job applications
                        </p>
                    </div>
                    <Link href="/jobs">
                        <Button className="gap-2 bg-[#FFB400] hover:bg-[#E5A300] text-white">
                            <Briefcase className="h-4 w-4" />
                            Browse Jobs
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-500/10">
                                    <Briefcase className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{applications.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Applications</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-yellow-500/10">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{groupedApplications.active.length}</p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-green-500/10">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {applications.filter(a => a.status === 'hired').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Accepted</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-purple-500/10">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {applications.filter(a => a.status === 'interview').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Interviews</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start exploring jobs and submit your first application
                            </p>
                            <Link href="/jobs">
                                <Button className="gap-2">
                                    Browse Available Jobs
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Active Applications */}
                        {groupedApplications.active.length > 0 && (
                            <div>
                                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    Active Applications ({groupedApplications.active.length})
                                </h2>
                                <div className="grid gap-4">
                                    {groupedApplications.active.map((app) => {
                                        const job = jobs.find(j => j.id === app.job_id);
                                        return (
                                            <Card key={app.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex gap-4">
                                                            <div className="p-3 rounded-lg bg-[#FFB400]/10">
                                                                {getStatusIcon(app.status)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-lg">
                                                                    {job?.title || 'Unknown Position'}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                                                    {job?.department && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Building className="h-4 w-4" />
                                                                            {job.department}
                                                                        </span>
                                                                    )}
                                                                    {job?.salary_range && (
                                                                        <span className="flex items-center gap-1">
                                                                            <DollarSign className="h-4 w-4" />
                                                                            {job.salary_range}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4" />
                                                                        Applied {formatDate(app.created_at)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge className={getStatusColor(app.status)}>
                                                            {getStatusLabel(app.status)}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Completed Applications */}
                        {groupedApplications.completed.length > 0 && (
                            <div>
                                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-gray-500" />
                                    Completed ({groupedApplications.completed.length})
                                </h2>
                                <div className="grid gap-4">
                                    {groupedApplications.completed.map((app) => {
                                        const job = jobs.find(j => j.id === app.job_id);
                                        return (
                                            <Card key={app.id} className="opacity-75">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex gap-4">
                                                            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                                                                {getStatusIcon(app.status)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {job?.title || 'Unknown Position'}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Applied {formatDate(app.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className={getStatusColor(app.status)}>
                                                            {getStatusLabel(app.status)}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
