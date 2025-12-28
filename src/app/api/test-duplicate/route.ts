import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Test duplicate application constraint
export async function GET() {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json({
            success: false,
            error: 'Supabase not configured'
        }, { status: 500 });
    }

    const testJobId = '5f4d8b22-f897-48c2-b0c6-a1aef5aecf6f';
    const testEmail = 'test.duplicate@example.com';
    const results: Record<string, unknown> = {};

    try {
        // Step 1: Clean up any existing test data
        await supabase
            .from('applications')
            .delete()
            .eq('email', testEmail);

        results.cleanup = 'Previous test data cleaned';

        // Step 2: First insert - should SUCCEED
        const { data: app1, error: error1 } = await supabase
            .from('applications')
            .insert([{
                job_id: testJobId,
                email: testEmail,
                applicant_name: 'Test User 1',
                status: 'applied',
                form_data: { test: true }
            }])
            .select()
            .single();

        results.firstInsert = {
            success: !error1,
            data: app1,
            error: error1?.message || null
        };

        // Step 3: Duplicate insert - should FAIL with UNIQUE violation
        const { data: app2, error: error2 } = await supabase
            .from('applications')
            .insert([{
                job_id: testJobId,
                email: testEmail, // SAME EMAIL
                applicant_name: 'Test User 2 - DUPLICATE',
                status: 'applied',
                form_data: { test: true, duplicate: true }
            }])
            .select()
            .single();

        results.duplicateInsert = {
            success: !error2,
            data: app2,
            error: error2?.message || null,
            isUniqueViolation: error2?.code === '23505' || error2?.message?.includes('duplicate') || error2?.message?.includes('unique')
        };

        // Step 4: Verify hasApplied would return true by querying
        const { data: checkData, error: checkError } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', testJobId)
            .eq('email', testEmail.toLowerCase().trim())
            .maybeSingle();

        results.hasAppliedCheck = {
            applicationExists: !!checkData,
            applicationId: checkData?.id,
            error: checkError?.message || null
        };

        // Step 5: Verify different email returns no result
        const { data: checkData2, error: checkError2 } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', testJobId)
            .eq('email', 'different.email@example.com')
            .maybeSingle();

        results.differentEmailCheck = {
            applicationExists: !!checkData2,
            error: checkError2?.message || null
        };

        // Summary
        results.summary = {
            firstInsertPassed: !error1,
            duplicateBlocked: !!error2,
            hasAppliedWorks: !!checkData && !checkData2,
            allTestsPassed: !error1 && !!error2 && !!checkData && !checkData2
        };

        return NextResponse.json({
            success: true,
            message: 'Duplicate constraint test completed',
            results
        });

    } catch (err) {
        return NextResponse.json({
            success: false,
            error: String(err),
            results
        }, { status: 500 });
    }
}
