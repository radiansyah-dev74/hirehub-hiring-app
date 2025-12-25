'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { Job } from '@/types';

export default function AdminJobsPage() {
    const { jobs, isLoadingJobs, fetchJobs, deleteJob } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && job.is_active) ||
            (statusFilter === 'inactive' && !job.is_active);
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this job?')) {
            await deleteJob(id);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
                        <p className="text-muted-foreground">
                            Manage your job postings
                        </p>
                    </div>
                    <Link href="/admin/jobs/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Job
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Jobs Grid */}
                {isLoadingJobs ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No jobs found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function JobCard({ job, onDelete }: { job: Job; onDelete: (id: string) => void }) {
    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {job.description || 'No description'}
                        </CardDescription>
                    </div>
                    <Badge variant={job.is_active ? 'default' : 'secondary'}>
                        {job.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {job.salary_range || 'Salary not specified'}
                    </div>
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/admin/candidates?job=${job.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Users className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => onDelete(job.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
