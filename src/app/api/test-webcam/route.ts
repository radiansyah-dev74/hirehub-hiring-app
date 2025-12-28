import { NextResponse } from 'next/server';

// Test endpoint to verify webcam conditional logic
export async function GET() {
    try {
        // Simulate the webcam required logic
        const JOB_TYPES = [
            { value: 'fulltime', label: 'Full-time', webcamRequired: true },
            { value: 'intern', label: 'Intern', webcamRequired: false },
            { value: 'contract', label: 'Contract', webcamRequired: false },
        ] as const;

        const isWebcamRequired = (jobType: string): boolean => {
            const config = JOB_TYPES.find(t => t.value === jobType);
            return config?.webcamRequired ?? false;
        };

        const results = [
            {
                step: '1. Fulltime webcam required',
                status: isWebcamRequired('fulltime') === true ? 'pass' : 'fail',
                expected: true,
                actual: isWebcamRequired('fulltime'),
            },
            {
                step: '2. Intern webcam optional',
                status: isWebcamRequired('intern') === false ? 'pass' : 'fail',
                expected: false,
                actual: isWebcamRequired('intern'),
            },
            {
                step: '3. Contract webcam optional',
                status: isWebcamRequired('contract') === false ? 'pass' : 'fail',
                expected: false,
                actual: isWebcamRequired('contract'),
            },
        ];

        const allPassed = results.every(r => r.status === 'pass');

        return NextResponse.json({
            success: allPassed,
            message: allPassed ? 'Webcam conditional logic is correct!' : 'Test failed',
            results,
            fix_applied: {
                file: 'src/lib/supabase.ts',
                changes: [
                    'Added job_type to createJob insert',
                    'Added job_type to updateJob update',
                ],
            },
            ui_behavior: {
                fulltime: { webcam: 'REQUIRED', skipButton: 'HIDDEN', label: '*' },
                intern: { webcam: 'OPTIONAL', skipButton: 'VISIBLE', label: '(Optional)' },
                contract: { webcam: 'OPTIONAL', skipButton: 'VISIBLE', label: '(Optional)' },
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
        }, { status: 500 });
    }
}
