'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { AVAILABLE_FORM_FIELDS, FieldRequirement, JobFormConfig } from '@/types';

type FormFieldConfig = {
    field_name: string;
    requirement: FieldRequirement;
};

export default function CreateJobPage() {
    const router = useRouter();
    const { createJob, updateFormConfig } = useAppStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [salaryRange, setSalaryRange] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form field configs
    const [fieldConfigs, setFieldConfigs] = useState<FormFieldConfig[]>(
        AVAILABLE_FORM_FIELDS.map((field) => ({
            field_name: field.name,
            requirement: 'optional' as FieldRequirement,
        }))
    );

    const updateFieldRequirement = (fieldName: string, requirement: FieldRequirement) => {
        setFieldConfigs((prev) =>
            prev.map((config) =>
                config.field_name === fieldName ? { ...config, requirement } : config
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a job title');
            return;
        }

        setIsSubmitting(true);

        try {
            const newJob = await createJob({
                title,
                description,
                salary_range: salaryRange,
                is_active: isActive,
            });

            // Save form field configurations
            await updateFormConfig(
                newJob.id,
                fieldConfigs.map((config) => ({
                    job_id: newJob.id,
                    field_name: config.field_name,
                    requirement: config.requirement,
                }))
            );

            router.push('/admin/jobs');
        } catch (error) {
            console.error('Failed to create job:', error);
            alert('Failed to create job. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
                        <p className="text-muted-foreground">
                            Set up a new job posting and configure application requirements
                        </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSubmitting ? 'Creating...' : 'Create Job'}
                    </Button>
                </div>

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
                                    required
                                />
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
                                <Label htmlFor="salary">Salary Range</Label>
                                <Input
                                    id="salary"
                                    placeholder="e.g. $100,000 - $130,000"
                                    value={salaryRange}
                                    onChange={(e) => setSalaryRange(e.target.value)}
                                />
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
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {AVAILABLE_FORM_FIELDS.map((field) => {
                                    const config = fieldConfigs.find((c) => c.field_name === field.name);
                                    return (
                                        <div
                                            key={field.name}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{field.label}</p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {field.type} field
                                                </p>
                                            </div>
                                            <Select
                                                value={config?.requirement || 'optional'}
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
