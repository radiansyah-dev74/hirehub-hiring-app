'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { GestureCamera } from '@/components/application/GestureCamera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AVAILABLE_FORM_FIELDS, Job, JobFormConfig } from '@/types';
import { generateApplicationSchema, ApplicationFormData } from '@/lib/validators';

export default function ApplyJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;

    const { jobs, fetchJobs, createApplication, error: storeError } = useAppStore();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [photoData, setPhotoData] = useState<string | null>(null);

    // Generate dynamic schema based on job's form config
    const validationSchema = useMemo(() => {
        if (!job?.form_configs) return null;
        return generateApplicationSchema(job.form_configs);
    }, [job?.form_configs]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useForm<any>({
        resolver: validationSchema ? zodResolver(validationSchema) : undefined,
        defaultValues: {
            applicant_name: '',
            email: '',
        },
    });

    useEffect(() => {
        fetchJobs().then(() => setIsLoading(false));
    }, [fetchJobs]);

    useEffect(() => {
        const foundJob = jobs.find((j) => j.id === jobId);
        setJob(foundJob || null);
    }, [jobs, jobId]);

    // Update photo in form when captured
    useEffect(() => {
        if (photoData) {
            setValue('photo', photoData);
        }
    }, [photoData, setValue]);

    const getFieldConfig = (fieldName: string): JobFormConfig | undefined => {
        return job?.form_configs?.find((config) => config.field_name === fieldName);
    };

    const isFieldVisible = (fieldName: string): boolean => {
        const config = getFieldConfig(fieldName);
        return config?.requirement !== 'hidden';
    };

    const isFieldRequired = (fieldName: string): boolean => {
        const config = getFieldConfig(fieldName);
        return config?.requirement === 'mandatory';
    };

    const onSubmit = async (data: ApplicationFormData) => {
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await createApplication({
                job_id: jobId,
                applicant_name: data.applicant_name,
                email: data.email,
                form_data: data,
                photo_url: photoData,
            });
            setSubmitStatus('success');
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Count required fields for progress indicator
    const visibleFields = AVAILABLE_FORM_FIELDS.filter(f => isFieldVisible(f.name));
    const requiredFields = visibleFields.filter(f => isFieldRequired(f.name));
    const watchedValues = watch();
    const filledRequired = requiredFields.filter(f => {
        const value = watchedValues[f.name];
        return value && String(value).trim() !== '';
    }).length;

    if (isLoading) {
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
                    <h2 className="text-2xl font-bold">Job not found</h2>
                    <p className="text-muted-foreground mt-2">This job may have been removed or doesn&apos;t exist.</p>
                    <Button onClick={() => router.push('/jobs')} className="mt-4">
                        Back to Jobs
                    </Button>
                </div>
            </MainLayout>
        );
    }

    if (submitStatus === 'success') {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold">Application Submitted!</h2>
                    <p className="mb-6 text-center text-muted-foreground">
                        Thank you for applying to <span className="font-medium text-foreground">{job.title}</span>.
                        <br />
                        We&apos;ll review your application and get back to you soon.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => router.push('/jobs')}>
                            Browse More Jobs
                        </Button>
                        <Button onClick={() => router.push('/applications')}>
                            View My Applications
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
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
                        <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {job.department && (
                                <Badge variant="outline">{job.department}</Badge>
                            )}
                            <span className="text-muted-foreground">{job.salary_range || 'Salary not specified'}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(filledRequired / Math.max(requiredFields.length, 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {filledRequired} of {requiredFields.length + 2} required fields
                    </span>
                </div>

                {/* Error Banner */}
                {(submitStatus === 'error' || storeError) && (
                    <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{storeError || 'Failed to submit application. Please try again.'}</span>
                    </div>
                )}

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Tell us about yourself</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="applicant_name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="applicant_name"
                                    placeholder="John Doe"
                                    {...register('applicant_name')}
                                    className={errors.applicant_name ? 'border-red-500' : ''}
                                />
                                {errors.applicant_name && (
                                    <p className="text-sm text-red-500">{String(errors.applicant_name.message)}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    {...register('email')}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{String(errors.email.message)}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Fields */}
                {visibleFields.filter(f => f.type !== 'camera').length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>Complete the fields as required by this position</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {AVAILABLE_FORM_FIELDS.filter(field => field.type !== 'camera' && isFieldVisible(field.name)).map((field) => {
                                const isRequired = isFieldRequired(field.name);
                                const hasError = !!errors[field.name];

                                return (
                                    <div key={field.name} className="space-y-2">
                                        <Label htmlFor={field.name}>
                                            {field.label} {isRequired && <span className="text-red-500">*</span>}
                                        </Label>

                                        {field.type === 'textarea' ? (
                                            <Textarea
                                                id={field.name}
                                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                                {...register(field.name)}
                                                className={hasError ? 'border-red-500' : ''}
                                                rows={4}
                                            />
                                        ) : field.type === 'select' && 'options' in field ? (
                                            <Select
                                                onValueChange={(value) => setValue(field.name, value)}
                                                defaultValue=""
                                            >
                                                <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {('options' in field ? Array.from(field.options as readonly string[]) : []).map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : field.type === 'date' ? (
                                            <Input
                                                id={field.name}
                                                type="date"
                                                {...register(field.name)}
                                                className={hasError ? 'border-red-500' : ''}
                                            />
                                        ) : (
                                            <Input
                                                id={field.name}
                                                type={field.type}
                                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                                {...register(field.name)}
                                                className={hasError ? 'border-red-500' : ''}
                                            />
                                        )}

                                        {hasError && (
                                            <p className="text-sm text-red-500">{errors[field.name]?.message as string}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Gesture Camera (if visible) */}
                {isFieldVisible('photo') && (
                    <div>
                        <GestureCamera
                            onCapture={setPhotoData}
                            required={isFieldRequired('photo')}
                        />
                        {errors.photo && !photoData && (
                            <p className="text-sm text-red-500 mt-2">{errors.photo.message as string}</p>
                        )}
                    </div>
                )}

                {/* Submit - Teal button like Figma */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2 bg-[#0891B2] hover:bg-[#0E7490] text-white font-semibold py-3"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </Button>
            </form>
        </MainLayout>
    );
}
