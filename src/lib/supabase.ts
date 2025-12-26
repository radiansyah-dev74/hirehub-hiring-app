import { createClient } from '@supabase/supabase-js';
import { Job, Application, JobFormConfig } from '@/types';

// Environment check - will use mock data if not configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client only if configured
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null;

// Database types for Supabase
export type DbJob = {
    id: string;
    title: string;
    description: string | null;
    department: string | null;
    salary_range: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type DbJobFormConfig = {
    id: string;
    job_id: string;
    field_name: string;
    requirement: 'mandatory' | 'optional' | 'hidden';
    created_at: string;
};

export type DbApplication = {
    id: string;
    job_id: string;
    applicant_name: string;
    email: string;
    status: 'applied' | 'interview' | 'hired' | 'rejected';
    form_data: Record<string, unknown>;
    photo_url: string | null;
    created_at: string;
};

// Supabase service functions
export const supabaseService = {
    // Jobs
    async fetchJobs(): Promise<Job[]> {
        if (!supabase) throw new Error('Supabase not configured');

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select(`
                *,
                form_configs:job_form_configs(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return jobs || [];
    },

    async createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('jobs')
            .insert({
                title: job.title,
                description: job.description,
                department: job.department,
                salary_range: job.salary_range,
                is_active: job.is_active,
            })
            .select()
            .single();

        if (error) throw error;

        // Insert form configs if provided
        if (job.form_configs && job.form_configs.length > 0) {
            await supabase
                .from('job_form_configs')
                .insert(
                    job.form_configs.map(config => ({
                        job_id: data.id,
                        field_name: config.field_name,
                        requirement: config.requirement,
                    }))
                );
        }

        return data;
    },

    async updateJob(id: string, updates: Partial<Job>): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase
            .from('jobs')
            .update({
                title: updates.title,
                description: updates.description,
                department: updates.department,
                salary_range: updates.salary_range,
                is_active: updates.is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteJob(id: string): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateFormConfig(jobId: string, configs: Omit<JobFormConfig, 'id' | 'created_at'>[]): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured');

        // Delete existing configs
        await supabase
            .from('job_form_configs')
            .delete()
            .eq('job_id', jobId);

        // Insert new configs
        if (configs.length > 0) {
            const { error } = await supabase
                .from('job_form_configs')
                .insert(
                    configs.map(config => ({
                        job_id: jobId,
                        field_name: config.field_name,
                        requirement: config.requirement,
                    }))
                );

            if (error) throw error;
        }
    },

    // Applications
    async fetchApplications(jobId?: string): Promise<Application[]> {
        if (!supabase) throw new Error('Supabase not configured');

        let query = supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (jobId) {
            query = query.eq('job_id', jobId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createApplication(application: Omit<Application, 'id' | 'created_at' | 'status'>): Promise<Application> {
        if (!supabase) throw new Error('Supabase not configured');

        // Check for duplicate
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', application.job_id)
            .eq('email', application.email)
            .single();

        if (existing) {
            throw new Error('You have already applied for this job.');
        }

        const { data, error } = await supabase
            .from('applications')
            .insert({
                job_id: application.job_id,
                applicant_name: application.applicant_name,
                email: application.email,
                form_data: application.form_data,
                photo_url: application.photo_url,
                status: 'applied',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateApplicationStatus(id: string, status: Application['status']): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    },

    // Storage - for photo uploads
    async uploadPhoto(file: Blob, fileName: string): Promise<string> {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase.storage
            .from('photos')
            .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    },
};
