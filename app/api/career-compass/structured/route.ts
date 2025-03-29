import { smoothStream, streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { CAREER_COMPASS_PROMPT } from '../prompt-template';
import { careerCompassSchema } from '@/lib/schema/career-compass-schema';

// Modify the prompt for structured object generation
const STRUCTURED_COMPASS_PROMPT = `${CAREER_COMPASS_PROMPT}\n\nProvide a structured analysis using the following format only, without any additional text or commentary outside the structure.

For the candidateProfile:
- Identify core technical strengths
- Analyze skill frequency and present as percentages
- Extract unique value proposition
- List certifications if any
- Summarize work experience with total tenure, transferable industries, and impactful projects
- Analyze educational pathways including degree utilization, certification opportunities, and emerging tech alignment

For each jobRecommendation:
- Provide the role title and experience level
- Include skills match, experience match, and education match
- Add salary benchmarks information
- List current opportunities with platform, search query, and URL
- Suggest skills to develop with title, description, duration and link
- Outline career path projections
- Include random forest insights about the role fit

For overallEvaluation:
- Calculate job fit scores as percentages for each role`

export async function POST(req: Request) {
    try {
        const resumeContent = await req.json();
        // Initialize the model
        const model = google('gemini-2.0-flash');

        // Generate streaming object response
        const response = streamObject({
            model,
            schema: careerCompassSchema,
            prompt: `${STRUCTURED_COMPASS_PROMPT}\n\nRESUME CONTENT TO ANALYZE:\n${resumeContent}`,
        });

        // Return the streaming response
        return response.toTextStreamResponse();
    } catch (error) {
        console.error('Error generating structured career compass answer:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to generate structured career compass answer'
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