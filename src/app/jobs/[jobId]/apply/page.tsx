'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { GestureCamera } from '@/components/application/GestureCamera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { AVAILABLE_FORM_FIELDS, Job, JobFormConfig } from '@/types';

export default function ApplyJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;

    const { jobs, fetchJobs, createApplication } = useAppStore();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Form state
    const [applicantName, setApplicantName] = useState('');
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [photoData, setPhotoData] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchJobs().then(() => setIsLoading(false));
    }, [fetchJobs]);

    useEffect(() => {
        const foundJob = jobs.find((j) => j.id === jobId);
        setJob(foundJob || null);
    }, [jobs, jobId]);

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

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
        // Clear validation error when user types
        if (validationErrors[fieldName]) {
            setValidationErrors((prev) => {
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!applicantName.trim()) {
            errors.applicantName = 'Name is required';
        }

        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        // Validate dynamic fields
        AVAILABLE_FORM_FIELDS.forEach((field) => {
            if (isFieldRequired(field.name) && !formData[field.name]?.trim()) {
                if (field.type === 'camera' && !photoData) {
                    errors[field.name] = `${field.label} is required`;
                } else if (field.type !== 'camera' && !formData[field.name]?.trim()) {
                    errors[field.name] = `${field.label} is required`;
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await createApplication({
                job_id: jobId,
                applicant_name: applicantName,
                email,
                form_data: { ...formData, photo: photoData },
                photo_url: photoData,
            });
            setSubmitStatus('success');
        } catch (err) {
            setSubmitStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
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
                    <div>
                        <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
                        <p className="text-muted-foreground">{job.salary_range || 'Salary not specified'}</p>
                    </div>
                </div>

                {/* Error Banner */}
                {submitStatus === 'error' && (
                    <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span>{errorMessage}</span>
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
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={applicantName}
                                    onChange={(e) => setApplicantName(e.target.value)}
                                    className={validationErrors.applicantName ? 'border-red-500' : ''}
                                />
                                {validationErrors.applicantName && (
                                    <p className="text-sm text-red-500">{validationErrors.applicantName}</p>
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={validationErrors.email ? 'border-red-500' : ''}
                                />
                                {validationErrors.email && (
                                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Fields */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                        <CardDescription>Complete the fields as required by this position</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {AVAILABLE_FORM_FIELDS.filter((field) => field.type !== 'camera').map((field) => {
                            if (!isFieldVisible(field.name)) return null;

                            const isRequired = isFieldRequired(field.name);
                            const hasError = !!validationErrors[field.name];

                            return (
                                <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name}>
                                        {field.label} {isRequired && <span className="text-red-500">*</span>}
                                    </Label>
                                    {field.type === 'textarea' ? (
                                        <Textarea
                                            id={field.name}
                                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                            className={hasError ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                    ) : (
                                        <Input
                                            id={field.name}
                                            type={field.type}
                                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                            className={hasError ? 'border-red-500' : ''}
                                        />
                                    )}
                                    {hasError && (
                                        <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Gesture Camera (if visible) */}
                {isFieldVisible('photo') && (
                    <GestureCamera
                        onCapture={setPhotoData}
                        required={isFieldRequired('photo')}
                    />
                )}

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
}
