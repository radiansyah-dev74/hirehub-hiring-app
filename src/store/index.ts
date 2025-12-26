import { create } from 'zustand';
import { Job, Application, JobFormConfig } from '@/types';
import { isSupabaseConfigured, supabaseService } from '@/lib/supabase';

// Store supports both mock data (for demo) and real Supabase integration

interface AppState {
    // Jobs
    jobs: Job[];
    isLoadingJobs: boolean;
    fetchJobs: () => Promise<void>;
    createJob: (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<Job>;
    updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;

    // Form Configs
    updateFormConfig: (jobId: string, configs: Omit<JobFormConfig, 'id' | 'created_at'>[]) => Promise<void>;

    // Applications
    applications: Application[];
    isLoadingApplications: boolean;
    fetchApplications: (jobId?: string) => Promise<void>;
    createApplication: (application: Omit<Application, 'id' | 'created_at' | 'status'>) => Promise<Application>;
    updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;

    // Auth simulation
    userRole: 'admin' | 'applicant' | null;
    setUserRole: (role: 'admin' | 'applicant' | null) => void;

    // Error handling
    error: string | null;
    setError: (error: string | null) => void;

    // Supabase mode indicator
    isUsingSupabase: boolean;
}

// Extended mock data for better demo experience
const mockJobs: Job[] = [
    {
        id: '1',
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced frontend developer with expertise in React, TypeScript, and modern CSS frameworks. You will be responsible for building user interfaces, optimizing performance, and mentoring junior developers.',
        department: 'Engineering',
        salary_range: 'Rp15.000.000 - Rp25.000.000',
        is_active: true,
        status: 'active',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '1', job_id: '1', field_name: 'phone', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '2', job_id: '1', field_name: 'gender', requirement: 'optional', created_at: new Date().toISOString() },
            { id: '3', job_id: '1', field_name: 'linkedin', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '4', job_id: '1', field_name: 'resume_url', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '5', job_id: '1', field_name: 'years_experience', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '6', job_id: '1', field_name: 'photo', requirement: 'mandatory', created_at: new Date().toISOString() },
        ],
    },
    {
        id: '2',
        title: 'Backend Engineer',
        description: 'Join our backend team to build scalable APIs and services using Node.js and PostgreSQL. Experience with microservices architecture is a plus.',
        department: 'Engineering',
        salary_range: 'Rp12.000.000 - Rp18.000.000',
        is_active: true,
        status: 'active',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '7', job_id: '2', field_name: 'phone', requirement: 'optional', created_at: new Date().toISOString() },
            { id: '8', job_id: '2', field_name: 'years_experience', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '9', job_id: '2', field_name: 'cover_letter', requirement: 'optional', created_at: new Date().toISOString() },
            { id: '10', job_id: '2', field_name: 'photo', requirement: 'optional', created_at: new Date().toISOString() },
        ],
    },
    {
        id: '3',
        title: 'UI/UX Designer',
        description: 'We need a creative designer to craft beautiful user experiences. Proficiency in Figma and understanding of design systems is required.',
        department: 'Design',
        salary_range: 'Rp10.000.000 - Rp15.000.000',
        is_active: true,
        status: 'active',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '11', job_id: '3', field_name: 'phone', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '12', job_id: '3', field_name: 'portfolio', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '13', job_id: '3', field_name: 'linkedin', requirement: 'optional', created_at: new Date().toISOString() },
        ],
    },
    {
        id: '4',
        title: 'Product Manager',
        description: 'Lead product strategy and work with cross-functional teams to deliver amazing products. Experience in agile methodologies required.',
        department: 'Product',
        salary_range: 'Rp18.000.000 - Rp28.000.000',
        is_active: false,
        status: 'inactive',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '14', job_id: '4', field_name: 'phone', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '15', job_id: '4', field_name: 'years_experience', requirement: 'mandatory', created_at: new Date().toISOString() },
        ],
    },
    {
        id: '5',
        title: 'Marketing Intern',
        description: 'Great opportunity for students or fresh graduates to learn digital marketing, social media management, and content creation.',
        department: 'Marketing',
        salary_range: 'Rp3.000.000 - Rp5.000.000',
        is_active: true,
        status: 'active',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '16', job_id: '5', field_name: 'phone', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '17', job_id: '5', field_name: 'domicile', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '18', job_id: '5', field_name: 'photo', requirement: 'optional', created_at: new Date().toISOString() },
        ],
    },
];

const mockApplications: Application[] = [
    {
        id: '1',
        job_id: '1',
        applicant_name: 'John Doe',
        email: 'john.doe@example.com',
        status: 'applied',
        form_data: {
            phone: '+62812345678',
            gender: 'Male',
            linkedin: 'https://linkedin.com/in/johndoe',
            resume_url: 'https://drive.google.com/resume-johndoe',
            years_experience: 5,
        },
        photo_url: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        job_id: '1',
        applicant_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        status: 'interview',
        form_data: {
            phone: '+62898765432',
            gender: 'Female',
            linkedin: 'https://linkedin.com/in/janesmith',
            resume_url: 'https://drive.google.com/resume-jane',
            years_experience: 7,
        },
        photo_url: null,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        job_id: '2',
        applicant_name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        status: 'applied',
        form_data: {
            phone: '+62811223344',
            years_experience: 3,
            cover_letter: 'I am excited to apply for this position...',
        },
        photo_url: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '4',
        job_id: '3',
        applicant_name: 'Sarah Lee',
        email: 'sarah.lee@example.com',
        status: 'hired',
        form_data: {
            phone: '+62899887766',
            portfolio: 'https://sarahlee.design',
            linkedin: 'https://linkedin.com/in/sarahlee',
        },
        photo_url: null,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '5',
        job_id: '1',
        applicant_name: 'Mike Chen',
        email: 'mike.chen@example.com',
        status: 'rejected',
        form_data: {
            phone: '+62877665544',
            gender: 'Male',
            linkedin: 'https://linkedin.com/in/mikechen',
            resume_url: 'https://drive.google.com/resume-mike',
            years_experience: 2,
        },
        photo_url: null,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '6',
        job_id: '5',
        applicant_name: 'Lisa Wang',
        email: 'lisa.wang@example.com',
        status: 'applied',
        form_data: {
            phone: '+62833445566',
            domicile: 'Jakarta',
        },
        photo_url: null,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
];

// Mutable reference for mock data to persist during session
let sessionJobs = [...mockJobs];
let sessionApplications = [...mockApplications];

export const useAppStore = create<AppState>((set, get) => ({
    // Jobs
    jobs: [],
    isLoadingJobs: false,
    isUsingSupabase: isSupabaseConfigured,
    error: null,

    setError: (error) => set({ error }),

    fetchJobs: async () => {
        set({ isLoadingJobs: true, error: null });
        try {
            if (isSupabaseConfigured) {
                const jobs = await supabaseService.fetchJobs();
                set({ jobs, isLoadingJobs: false });
            } else {
                // Simulate API delay for mock data
                await new Promise(resolve => setTimeout(resolve, 300));
                set({ jobs: sessionJobs, isLoadingJobs: false });
            }
        } catch (error) {
            set({ error: (error as Error).message, isLoadingJobs: false });
        }
    },

    createJob: async (jobData) => {
        set({ error: null });
        try {
            if (isSupabaseConfigured) {
                const job = await supabaseService.createJob(jobData);
                set(state => ({ jobs: [job, ...state.jobs] }));
                return job;
            } else {
                const newJob: Job = {
                    ...jobData,
                    id: crypto.randomUUID(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                sessionJobs = [newJob, ...sessionJobs];
                set(state => ({ jobs: [newJob, ...state.jobs] }));
                return newJob;
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateJob: async (id, updates) => {
        set({ error: null });
        try {
            if (isSupabaseConfigured) {
                await supabaseService.updateJob(id, updates);
            }
            set(state => ({
                jobs: state.jobs.map(job =>
                    job.id === id ? { ...job, ...updates, updated_at: new Date().toISOString() } : job
                ),
            }));
            // Update session data
            sessionJobs = sessionJobs.map(job =>
                job.id === id ? { ...job, ...updates, updated_at: new Date().toISOString() } : job
            );
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteJob: async (id) => {
        set({ error: null });
        try {
            if (isSupabaseConfigured) {
                await supabaseService.deleteJob(id);
            }
            set(state => ({ jobs: state.jobs.filter(job => job.id !== id) }));
            sessionJobs = sessionJobs.filter(job => job.id !== id);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    // Form Configs
    updateFormConfig: async (jobId, configs) => {
        set({ error: null });
        try {
            if (isSupabaseConfigured) {
                await supabaseService.updateFormConfig(jobId, configs);
            }
            set(state => ({
                jobs: state.jobs.map(job => {
                    if (job.id !== jobId) return job;
                    return {
                        ...job,
                        form_configs: configs.map((config, index) => ({
                            ...config,
                            id: `${jobId}-${index}`,
                            created_at: new Date().toISOString(),
                        })),
                    };
                }),
            }));
            // Update session data
            sessionJobs = sessionJobs.map(job => {
                if (job.id !== jobId) return job;
                return {
                    ...job,
                    form_configs: configs.map((config, index) => ({
                        ...config,
                        id: `${jobId}-${index}`,
                        created_at: new Date().toISOString(),
                    })),
                };
            });
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    // Applications
    applications: [],
    isLoadingApplications: false,

    fetchApplications: async (jobId) => {
        set({ isLoadingApplications: true, error: null });
        try {
            if (isSupabaseConfigured) {
                const applications = await supabaseService.fetchApplications(jobId);
                set({ applications, isLoadingApplications: false });
            } else {
                await new Promise(resolve => setTimeout(resolve, 300));
                const filtered = jobId
                    ? sessionApplications.filter(app => app.job_id === jobId)
                    : sessionApplications;
                set({ applications: filtered, isLoadingApplications: false });
            }
        } catch (error) {
            set({ error: (error as Error).message, isLoadingApplications: false });
        }
    },

    createApplication: async (appData) => {
        set({ error: null });
        // Check for duplicate in current state
        const existingApp = get().applications.find(
            app => app.job_id === appData.job_id && app.email === appData.email
        );
        if (existingApp) {
            const error = new Error('You have already applied for this job.');
            set({ error: error.message });
            throw error;
        }

        try {
            if (isSupabaseConfigured) {
                const app = await supabaseService.createApplication(appData);
                set(state => ({ applications: [app, ...state.applications] }));
                return app;
            } else {
                const newApp: Application = {
                    ...appData,
                    id: crypto.randomUUID(),
                    status: 'applied',
                    created_at: new Date().toISOString(),
                };
                sessionApplications = [newApp, ...sessionApplications];
                set(state => ({ applications: [newApp, ...state.applications] }));
                return newApp;
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateApplicationStatus: async (id, status) => {
        set({ error: null });
        try {
            if (isSupabaseConfigured) {
                await supabaseService.updateApplicationStatus(id, status);
            }
            set(state => ({
                applications: state.applications.map(app =>
                    app.id === id ? { ...app, status } : app
                ),
            }));
            sessionApplications = sessionApplications.map(app =>
                app.id === id ? { ...app, status } : app
            );
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    // Auth
    userRole: null,
    setUserRole: (role) => set({ userRole: role }),
}));
