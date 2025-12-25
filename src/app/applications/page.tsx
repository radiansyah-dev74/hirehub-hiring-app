'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Briefcase, Clock, ExternalLink } from 'lucide-react';
import { ApplicationStatus } from '@/types';

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
    applied: { label: 'Under Review', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    interview: { label: 'Interview', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    hired: { label: 'Hired', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    rejected: { label: 'Rejected', color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

export default function MyApplicationsPage() {
    const { applications, jobs, fetchApplications, fetchJobs } = useAppStore();

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [fetchJobs, fetchApplications]);

    const getJobTitle = (jobId: string) => {
        const job = jobs.find((j) => j.id === jobId);
        return job?.title || 'Unknown Position';
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                    <p className="text-muted-foreground">
                        Track the status of your job applications
                    </p>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">No applications yet</h3>
                            <p className="mb-4 text-muted-foreground">
                                Start exploring opportunities and submit your first application
                            </p>
                            <Link href="/jobs">
                                <Button>Browse Jobs</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => {
                            const status = statusConfig[application.status];
                            return (
                                <Card key={application.id} className="transition-shadow hover:shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                    {getJobTitle(application.job_id)}
                                                </CardTitle>
                                                <CardDescription>
                                                    Applied as: {application.applicant_name}
                                                </CardDescription>
                                            </div>
                                            <Badge className={`${status.bgColor} ${status.color}`}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        Applied {new Date(application.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link href={`/jobs/${application.job_id}/apply`}>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    View Details
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Status Timeline */}
                                        <div className="mt-4 flex items-center gap-2">
                                            {['applied', 'interview', 'hired'].map((step, index) => {
                                                const isCompleted =
                                                    application.status === 'hired' ||
                                                    (application.status === 'interview' && step === 'applied') ||
                                                    step === 'applied';
                                                const isCurrent = application.status === step;
                                                const isRejected = application.status === 'rejected';

                                                return (
                                                    <div key={step} className="flex items-center gap-2">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${isRejected
                                                                    ? 'bg-gray-300'
                                                                    : isCompleted
                                                                        ? 'bg-green-500'
                                                                        : isCurrent
                                                                            ? 'bg-blue-500'
                                                                            : 'bg-gray-300'
                                                                }`}
                                                        />
                                                        <span
                                                            className={`text-xs capitalize ${isRejected
                                                                    ? 'text-gray-400'
                                                                    : isCompleted || isCurrent
                                                                        ? 'text-foreground'
                                                                        : 'text-muted-foreground'
                                                                }`}
                                                        >
                                                            {step}
                                                        </span>
                                                        {index < 2 && (
                                                            <div
                                                                className={`h-px w-8 ${isCompleted && step !== application.status
                                                                        ? 'bg-green-500'
                                                                        : 'bg-gray-300'
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
