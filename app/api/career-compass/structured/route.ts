import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

// Structured object generation prompt that extracts the same data points as the Career Compass
const STRUCTURED_COMPASS_PROMPT = `Generate a structured JSON object with comprehensive career analysis data based on the resume.
Output ONLY a valid JSON object with the following structure (no other text or explanation):

{
  "candidateProfile": {
    "coreCompetencies": {
      "technicalStrengths": ["list of key technical strengths"],
      "skillFrequencyAnalysis": {
        "JavaScript": 75,
        "React": 60,
        "TypeScript": 45
        // Include actual skill names as keys and numeric values (not strings) representing frequency/proficiency
      },
      "uniqueValueProposition": "what makes the candidate distinct",
      "certifications": ["list of certifications if any"]
    },
    "workExperience": {
      "totalProfessionalTenure": "summary of years by role/industry",
      "industryTransferPotential": ["list of industries where skills transfer"],
      "mostImpactfulProject": {
        "title": "project name",
        "description": "brief description",
        "impact": "measurable outcomes",
        "relevance": "to career goals"
      }
    },
    "education": {
      "degreeUtilization": ["possible applications of degree to careers"],
      "certificationOpportunities": ["suggested certifications based on skills"],
      "emergingTechAlignment": ["emerging technologies relevant to candidate"]
    }
  },
  "jobRecommendations": [
    // IMPORTANT: Generate 5-7 job recommendations total, not just one
    {
      "roleTitle": "job title",
      "experienceLevel": "entry/mid/senior",
      "assessment": {
        "skillsMatch": ["matching skills"],
        "experienceMatch": "experience alignment description",
        "educationMatch": "education relevance description"
      },
      "salaryBenchmarks": {
        "range": "salary range",
        "factors": ["industry", "location", "company size"]
      },
      "currentOpportunities": [
        // IMPORTANT: Include exactly 4 platforms with searchable links
        {
          "platform": "LinkedIn",
          "searchQuery": "search query text",
          "url": "direct URL to search"
        },
        {
          "platform": "Indeed",
          "searchQuery": "search query text", 
          "url": "direct URL to search"
        },
        {
          "platform": "Glassdoor",
          "searchQuery": "search query text",
          "url": "direct URL to search"
        },
        {
          "platform": "AngelList",
          "searchQuery": "search query text",
          "url": "direct URL to search"
        }
      ],
      "skillDevelopment": [
        // IMPORTANT: Include exactly 4 skill development resources of different types
        // Mix of courses, certifications, tutorials, and books
        {
          "title": "Free Course: Advanced React Patterns",
          "description": "Learn component composition and reusability techniques",
          "duration": "6h 30m",
          "link": "https://example.com/react-patterns"
        },
        {
          "title": "AWS Certified Developer Associate",
          "description": "Cloud development certification covering core AWS services",
          "duration": "80h 0m",
          "link": "https://aws.amazon.com/certification/developer-associate/"
        },
        {
          "title": "Interactive TypeScript Tutorial",
          "description": "Hands-on exercises for TypeScript fundamentals",
          "duration": "4h 0m",
          "link": "https://www.typescriptlang.org/play"
        },
        {
          "title": "Book: Clean Code by Robert C. Martin",
          "description": "Principles for writing maintainable code",
          "duration": "20h 0m",
          "link": "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882"
        }
      ],
      "careerPathProjections": {
        "potentialPaths": ["possible career trajectories"],
        "requiredSteps": ["certifications", "additional experience needed"]
      },
      "randomForestInsights": "explanation of how the model matched this role"
    }
  ],
  "overallEvaluation": {
    "jobFitScores": {
      "jobTitle": "percentage as number"
    }
  }
}`

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Check for inputs - either file or text
        const file = formData.get('file') as File | null;
        const text = formData.get('text') as string | null;

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
                        text: `${STRUCTURED_COMPASS_PROMPT}\n\nAnalyze the resume in the attached PDF file for structured object generation:`
                    },
                    {
                        type: 'file' as const,
                        data: fileBuffer,
                        mimeType: 'application/pdf'
                    }
                ]
            }];

            // Generate streaming object response with file input
            const response = streamObject({
                model,
                output: 'no-schema',
                messages,
            });

            // Return the streaming response
            return response.toTextStreamResponse();
        }
        // Handle text input (manually entered details or extracted from DOCX)
        else if (text) {
            // Generate streaming object response with text input
            const response = streamObject({
                model,
                output: 'no-schema',
                prompt: `${STRUCTURED_COMPASS_PROMPT}\n\nRESUME CONTENT TO ANALYZE:\n${text}`,
            });

            // Return the streaming response
            return response.toTextStreamResponse();
        } else {
            throw new Error('No file or text provided');
        }

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