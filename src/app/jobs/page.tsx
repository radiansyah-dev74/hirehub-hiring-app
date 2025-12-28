'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, DollarSign, Clock, ArrowRight, Camera } from 'lucide-react';
import { Job, JOB_TYPES } from '@/types';

export default function JobsPage() {
    const { jobs, applications, fetchJobs, fetchApplications } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [fetchJobs, fetchApplications]);

    const activeJobs = jobs.filter((job) => job.is_active);

    const filteredJobs = activeJobs.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasApplied = (jobId: string) => {
        return applications.some((app) => app.job_id === jobId);
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10">
                        <h1 className="mb-2 text-4xl font-bold">Find Your Dream Job</h1>
                        <p className="mb-6 text-lg text-white/80">
                            Discover opportunities that match your skills and passion
                        </p>
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search jobs by title or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 border-0 bg-white pl-12 text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> open positions
                    </p>
                </div>

                {/* Jobs Grid */}
                {filteredJobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No jobs found matching your search</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} applied={hasApplied(job.id)} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function JobCard({ job, applied }: { job: Job; applied: boolean }) {
    const jobTypeInfo = JOB_TYPES.find(t => t.value === job.job_type) || JOB_TYPES[0];

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg transition-colors group-hover:text-primary">
                            {job.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                            {job.description || 'No description available'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {job.salary_range && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary_range}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{jobTypeInfo.label}</span>
                    </div>
                    {jobTypeInfo.webcamRequired && (
                        <div className="flex items-center gap-1 text-orange-500">
                            <Camera className="h-4 w-4" />
                            <span className="text-xs">Photo required</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Remote</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    {applied ? (
                        <Badge variant="secondary">Already Applied</Badge>
                    ) : (
                        <div />
                    )}
                    <Link href={`/jobs/${job.id}/apply`}>
                        <Button
                            size="sm"
                            className="gap-2 transition-all group-hover:gap-3"
                            disabled={applied}
                        >
                            {applied ? 'Applied' : 'Apply Now'}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
