import { NextRequest, NextResponse } from 'next/server';
import { validateResume } from '@/lib/actions/resume-validator';

/**
 * API endpoint for resume validation that supports request cancellation
 * This endpoint allows client-side AbortController to cancel the request
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ isValid: false, error: 'No file provided' }, { status: 400 });
        }

        // Process file and validate
        const fileBuffer = await file.arrayBuffer();
        const result = await validateResume({
            file: fileBuffer,
            filename: file.name
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing file for validation:', error);
        return NextResponse.json(
            { isValid: false, error: error instanceof Error ? error.message : 'Failed to process file' },
            { status: 500 }
        );
    }
}
