import { smoothStream, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { CAREER_COMPASS_PROMPT } from './prompt-template';


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Check for inputs - either file or text
        const file = formData.get('file') as File | null;
        const text = formData.get('text') as string | null;

        // Guard clause - require either text or file
        if (!file && !text) {
            return new Response(
                JSON.stringify({ error: 'No content provided for analysis' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Initialize the model
        const model = google('gemini-2.0-flash');

        // Handle PDF file uploads
        if (file && file.name.toLowerCase().endsWith('.pdf')) {
            const fileBuffer = await file.arrayBuffer();

            // Create message with file content for PDFs
            const messages = [{
                role: 'user' as const,
                content: [
                    {
                        type: 'text' as const,
                        text: `${CAREER_COMPASS_PROMPT}\n\nAnalyze the resume in the attached PDF file using this format:`
                    },
                    {
                        type: 'file' as const,
                        data: fileBuffer,
                        mimeType: 'application/pdf'
                    }
                ]
            }];

            // Generate streaming response with file input
            const response = streamText({
                model,
                messages,
                experimental_transform: smoothStream()
            });

            // Return the streaming response
            return response.toTextStreamResponse({
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                },
            });
        }
        // Handle text input (manually entered details or extracted from DOCX)
        else if (text) {
            // Generate streaming response with text input
            const response = streamText({
                model,
                prompt: `${CAREER_COMPASS_PROMPT}\n\nRESUME CONTENT TO ANALYZE:\n${text}`,
                experimental_transform: smoothStream()
            });

            // Return the streaming response
            return response.toTextStreamResponse({
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                },
            });
        }
        // Unsupported format
        else {
            return new Response(
                JSON.stringify({ error: 'Unsupported file format. Only PDF files or text content are supported.' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
    } catch (error) {
        console.error('Error generating career compass answer:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to generate career compass answer'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}