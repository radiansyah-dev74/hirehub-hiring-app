import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';

export async function GET() {
    // First check if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json({
            success: false,
            error: 'Supabase not configured. Check .env.local file.',
            isSupabaseConfigured
        }, { status: 500 });
    }

    try {
        // Test connection
        const connectionTest = await testSupabaseConnection();

        // Query jobs table
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .limit(5);

        // Query applications table
        const { data: applications, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .limit(5);

        return NextResponse.json({
            success: true,
            connectionTest,
            jobs: {
                data: jobs,
                error: jobsError?.message,
                count: jobs?.length || 0
            },
            applications: {
                data: applications,
                error: appsError?.message,
                count: applications?.length || 0
            }
        });
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: String(err)
        }, { status: 500 });
    }
}

// POST handler to insert sample job for testing
export async function POST() {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json({
            success: false,
            error: 'Supabase not configured'
        }, { status: 500 });
    }

    try {
        // Insert sample job
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .insert([{
                title: 'Test Job - Software Engineer',
                description: 'This is a test job created via API',
                department: 'Engineering',
                job_type: 'fulltime',
                salary_range: 'Rp7.000.000 - Rp10.000.000',
                is_active: true,
                status: 'active'
            }])
            .select()
            .single();

        if (jobError) {
            return NextResponse.json({
                success: false,
                error: jobError.message,
                code: jobError.code
            }, { status: 400 });
        }

        // Fetch updated job count
        const { data: allJobs } = await supabase.from('jobs').select('id, title');

        return NextResponse.json({
            success: true,
            message: 'Sample job inserted successfully!',
            insertedJob: job,
            totalJobs: allJobs?.length || 0,
            allJobs
        });
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: String(err)
        }, { status: 500 });
    }
}
