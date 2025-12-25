import { create } from 'zustand';
import { Job, Application, JobFormConfig } from '@/types';

// Since we don't have a real Supabase connection yet, we'll use mock data
// This store simulates backend operations

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
}

// Mock data
const mockJobs: Job[] = [
    {
        id: '1',
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced frontend developer to join our team.',
        salary_range: '$120,000 - $150,000',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '1', job_id: '1', field_name: 'phone', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '2', job_id: '1', field_name: 'linkedin', requirement: 'optional', created_at: new Date().toISOString() },
            { id: '3', job_id: '1', field_name: 'resume_url', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '4', job_id: '1', field_name: 'photo', requirement: 'optional', created_at: new Date().toISOString() },
        ],
    },
    {
        id: '2',
        title: 'Backend Engineer',
        description: 'Join our backend team to build scalable APIs and services.',
        salary_range: '$100,000 - $130,000',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        form_configs: [
            { id: '5', job_id: '2', field_name: 'phone', requirement: 'optional', created_at: new Date().toISOString() },
            { id: '6', job_id: '2', field_name: 'years_experience', requirement: 'mandatory', created_at: new Date().toISOString() },
            { id: '7', job_id: '2', field_name: 'cover_letter', requirement: 'hidden', created_at: new Date().toISOString() },
        ],
    },
];

const mockApplications: Application[] = [
    {
        id: '1',
        job_id: '1',
        applicant_name: 'John Doe',
        email: 'john@example.com',
        status: 'applied',
        form_data: { phone: '+1234567890', linkedin: 'https://linkedin.com/in/johndoe' },
        photo_url: null,
        created_at: new Date().toISOString(),
    },
];

export const useAppStore = create<AppState>((set, get) => ({
    // Jobs
    jobs: [],
    isLoadingJobs: false,

    fetchJobs: async () => {
        set({ isLoadingJobs: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ jobs: mockJobs, isLoadingJobs: false });
    },

    createJob: async (jobData) => {
        const newJob: Job = {
            ...jobData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        set(state => ({ jobs: [...state.jobs, newJob] }));
        return newJob;
    },

    updateJob: async (id, updates) => {
        set(state => ({
            jobs: state.jobs.map(job =>
                job.id === id ? { ...job, ...updates, updated_at: new Date().toISOString() } : job
            ),
        }));
    },

    deleteJob: async (id) => {
        set(state => ({ jobs: state.jobs.filter(job => job.id !== id) }));
    },

    // Form Configs
    updateFormConfig: async (jobId, configs) => {
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
    },

    // Applications
    applications: [],
    isLoadingApplications: false,

    fetchApplications: async (jobId) => {
        set({ isLoadingApplications: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        const filtered = jobId
            ? mockApplications.filter(app => app.job_id === jobId)
            : mockApplications;
        set({ applications: filtered, isLoadingApplications: false });
    },

    createApplication: async (appData) => {
        const existingApp = get().applications.find(
            app => app.job_id === appData.job_id && app.email === appData.email
        );
        if (existingApp) {
            throw new Error('You have already applied for this job.');
        }

        const newApp: Application = {
            ...appData,
            id: crypto.randomUUID(),
            status: 'applied',
            created_at: new Date().toISOString(),
        };
        set(state => ({ applications: [...state.applications, newApp] }));
        return newApp;
    },

    updateApplicationStatus: async (id, status) => {
        set(state => ({
            applications: state.applications.map(app =>
                app.id === id ? { ...app, status } : app
            ),
        }));
    },

    // Auth
    userRole: null,
    setUserRole: (role) => set({ userRole: role }),
}));
