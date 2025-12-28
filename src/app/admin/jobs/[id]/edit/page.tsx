'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { AVAILABLE_FORM_FIELDS, DEPARTMENTS, FieldRequirement, Job, JOB_TYPES, JobType } from '@/types';

type FormFieldConfig = {
    field_name: string;
    requirement: FieldRequirement;
};

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { jobs, fetchJobs, updateJob, updateFormConfig, error, isLoadingJobs } = useAppStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [jobType, setJobType] = useState<JobType>('fulltime');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [fieldConfigs, setFieldConfigs] = useState<FormFieldConfig[]>([]);

    // Fetch job data
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Populate form when job data is available
    useEffect(() => {
        const job = jobs.find(j => j.id === jobId);
        if (job && !isLoaded) {
            setTitle(job.title);
            setDescription(job.description || '');
            setDepartment(job.department || '');
            setJobType(job.job_type || 'fulltime');
            setIsActive(job.is_active);

            // Parse salary range
            if (job.salary_range) {
                const match = job.salary_range.match(/Rp([\d.]+)\s*-\s*Rp([\d.]+)/);
                if (match) {
                    setSalaryMin(match[1].replace(/\./g, ''));
                    setSalaryMax(match[2].replace(/\./g, ''));
                }
            }

            // Set form field configs from job
            if (job.form_configs && job.form_configs.length > 0) {
                const configs = AVAILABLE_FORM_FIELDS.map(field => {
                    const existing = job.form_configs?.find(c => c.field_name === field.name);
                    return {
                        field_name: field.name,
                        requirement: existing?.requirement || 'hidden' as FieldRequirement,
                    };
                });
                setFieldConfigs(configs);
            } else {
                setFieldConfigs(
                    AVAILABLE_FORM_FIELDS.map(field => ({
                        field_name: field.name,
                        requirement: 'optional' as FieldRequirement,
                    }))
                );
            }
            setIsLoaded(true);
        }
    }, [jobs, jobId, isLoaded]);

    const updateFieldRequirement = (fieldName: string, requirement: FieldRequirement) => {
        setFieldConfigs((prev) =>
            prev.map((config) =>
                config.field_name === fieldName ? { ...config, requirement } : config
            )
        );
    };

    // Format salary to Rupiah format
    const formatSalaryRange = () => {
        if (!salaryMin && !salaryMax) return null;
        const formatNumber = (num: string) => {
            const n = parseInt(num.replace(/\D/g, ''));
            if (isNaN(n)) return '';
            return new Intl.NumberFormat('id-ID').format(n);
        };
        const min = formatNumber(salaryMin);
        const max = formatNumber(salaryMax);
        if (min && max) return `Rp${min} - Rp${max}`;
        if (min) return `Rp${min}+`;
        if (max) return `Up to Rp${max}`;
        return null;
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!title.trim()) errors.title = 'Job title is required';
        if (title.length < 3) errors.title = 'Title must be at least 3 characters';
        if (!department) errors.department = 'Please select a department';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            await updateJob(jobId, {
                title,
                description: description || null,
                department,
                job_type: jobType,
                salary_range: formatSalaryRange(),
                is_active: isActive,
                status: isActive ? 'active' : 'inactive',
            });

            // Update form field configurations
            await updateFormConfig(
                jobId,
                fieldConfigs
                    .filter(c => c.requirement !== 'hidden')
                    .map((config) => ({
                        job_id: jobId,
                        field_name: config.field_name,
                        requirement: config.requirement,
                    }))
            );

            router.push('/admin/jobs');
        } catch (err) {
            console.error('Failed to update job:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const mandatoryCount = fieldConfigs.filter(c => c.requirement === 'mandatory').length;
    const optionalCount = fieldConfigs.filter(c => c.requirement === 'optional').length;
    const hiddenCount = fieldConfigs.filter(c => c.requirement === 'hidden').length;

    const job = jobs.find(j => j.id === jobId);

    if (isLoadingJobs || !isLoaded) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!job) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-destructive">Job Not Found</h2>
                    <p className="text-muted-foreground mt-2">The job you&apos;re looking for doesn&apos;t exist.</p>
                    <Button onClick={() => router.push('/admin/jobs')} className="mt-4">
                        Back to Jobs
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-bold">Edit Job</h1>
                        <p className="text-sm text-muted-foreground">
                            Update job details and application requirements
                        </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="gap-2 bg-[#FFB400] hover:bg-[#E5A300] text-white">
                        <Save className="h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Error display */}
                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Job Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>Basic information about the position</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={validationErrors.title ? 'border-destructive' : ''}
                                />
                                {validationErrors.title && (
                                    <p className="text-sm text-destructive">{validationErrors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department *</Label>
                                <Select value={department} onValueChange={setDepartment}>
                                    <SelectTrigger className={validationErrors.department ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEPARTMENTS.map((dept) => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.department && (
                                    <p className="text-sm text-destructive">{validationErrors.department}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jobType">Job Type *</Label>
                                <Select value={jobType} onValueChange={(value) => setJobType(value as typeof jobType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JOB_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <span className="flex items-center gap-2">
                                                    {type.label}
                                                    {type.webcamRequired && (
                                                        <span className="text-xs text-muted-foreground">(Webcam required)</span>
                                                    )}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {jobType === 'fulltime' ? '📷 Webcam photo is mandatory for this job type' : '📷 Webcam photo is optional for this job type'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Salary Range (Rupiah)</Label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                        <Input
                                            placeholder="Min (e.g. 10000000)"
                                            value={salaryMin}
                                            onChange={(e) => setSalaryMin(e.target.value.replace(/\D/g, ''))}
                                            className="pl-8"
                                        />
                                    </div>
                                    <span className="text-muted-foreground">-</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                        <Input
                                            placeholder="Max (e.g. 15000000)"
                                            value={salaryMax}
                                            onChange={(e) => setSalaryMax(e.target.value.replace(/\D/g, ''))}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                {formatSalaryRange() && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        Preview: {formatSalaryRange()}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Make this job visible to applicants
                                    </p>
                                </div>
                                <Switch
                                    id="active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Field Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Form Fields</CardTitle>
                            <CardDescription>
                                Configure which fields applicants must fill out
                            </CardDescription>
                            <div className="flex gap-2 pt-2">
                                <Badge variant="destructive" className="gap-1">
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                    {mandatoryCount} Mandatory
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    {optionalCount} Optional
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                                    {hiddenCount} Hidden
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {AVAILABLE_FORM_FIELDS.map((field) => {
                                    const config = fieldConfigs.find((c) => c.field_name === field.name);
                                    const requirement = config?.requirement || 'optional';
                                    return (
                                        <div
                                            key={field.name}
                                            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${requirement === 'mandatory'
                                                ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                                                : requirement === 'hidden'
                                                    ? 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20 opacity-60'
                                                    : ''
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium">{field.label}</p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {field.type} field
                                                </p>
                                            </div>
                                            <Select
                                                value={requirement}
                                                onValueChange={(value: FieldRequirement) =>
                                                    updateFieldRequirement(field.name, value)
                                                }
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mandatory">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-red-500" />
                                                            Mandatory
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="optional">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                            Optional
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="hidden">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                                                            Hidden
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </MainLayout>
    );
}
