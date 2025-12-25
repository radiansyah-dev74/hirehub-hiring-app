// Job related types
export type FieldRequirement = 'mandatory' | 'optional' | 'hidden';

export interface JobFormConfig {
    id: string;
    job_id: string;
    field_name: string;
    requirement: FieldRequirement;
    created_at: string;
}

export interface Job {
    id: string;
    title: string;
    description: string | null;
    salary_range: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    form_configs?: JobFormConfig[];
}

// Application related types
export type ApplicationStatus = 'applied' | 'interview' | 'hired' | 'rejected';

export interface Application {
    id: string;
    job_id: string;
    applicant_name: string;
    email: string;
    status: ApplicationStatus;
    form_data: Record<string, unknown>;
    photo_url: string | null;
    created_at: string;
    job?: Job;
}

// Form field definitions for dynamic forms
export const AVAILABLE_FORM_FIELDS = [
    { name: 'phone', label: 'Phone Number', type: 'tel' },
    { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
    { name: 'resume_url', label: 'Resume Link', type: 'url' },
    { name: 'portfolio', label: 'Portfolio URL', type: 'url' },
    { name: 'years_experience', label: 'Years of Experience', type: 'number' },
    { name: 'cover_letter', label: 'Cover Letter', type: 'textarea' },
    { name: 'photo', label: 'Profile Photo (Gesture)', type: 'camera' },
] as const;

export type AvailableFieldName = typeof AVAILABLE_FORM_FIELDS[number]['name'];
