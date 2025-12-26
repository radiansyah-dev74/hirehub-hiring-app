'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Job } from '@/types';

export default function AdminJobsPage() {
    const { jobs, isLoadingJobs, fetchJobs, deleteJob } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Filter jobs by search
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) =>
            job.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [jobs, searchQuery]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this job?')) {
            await deleteJob(id);
        }
    };

    // Get status badge styling based on Figma design
    const getStatusBadge = (job: Job) => {
        if (job.is_active) {
            return (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                    Active
                </Badge>
            );
        }
        return (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                Inactive
            </Badge>
        );
    };

    // Format date like Figma: "12 Dec 2024"
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header - Following Figma design */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Job List</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage all job vacancies
                        </p>
                    </div>
                    <Link href="/admin/jobs/new">
                        <Button className="gap-2 bg-[#FFB400] text-[#1D1F20] hover:bg-[#E5A300] font-semibold">
                            <Plus className="h-4 w-4" />
                            Add New Job
                        </Button>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search job name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card border-border"
                    />
                </div>

                {/* Job List Table - Following Figma design */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">
                            All Jobs ({filteredJobs.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoadingJobs ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFB400] border-t-transparent" />
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 text-6xl">📋</div>
                                <h3 className="mb-2 font-heading text-lg font-semibold">No job vacancies yet</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Create your first job to start receiving applications
                                </p>
                                <Link href="/admin/jobs/new">
                                    <Button className="bg-[#FFB400] text-[#1D1F20] hover:bg-[#E5A300]">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create a new job
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Job Name</TableHead>
                                        <TableHead className="font-semibold">Start Date</TableHead>
                                        <TableHead className="font-semibold">Salary Range</TableHead>
                                        <TableHead className="text-right font-semibold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.map((job) => (
                                        <TableRow key={job.id} className="border-border">
                                            <TableCell>
                                                {getStatusBadge(job)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{job.title}</p>
                                                    {job.department && (
                                                        <p className="text-xs text-muted-foreground">{job.department}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(job.created_at)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {job.salary_range || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/jobs/${job.id}/edit`} className="flex items-center gap-2">
                                                                <Pencil className="h-4 w-4" />
                                                                Edit Job
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/candidates?job=${job.id}`} className="flex items-center gap-2">
                                                                <Users className="h-4 w-4" />
                                                                View Candidates
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="flex items-center gap-2 text-red-500 focus:text-red-500"
                                                            onClick={() => handleDelete(job.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Job
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
