import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

// Structured object generation prompt that extracts the same data points as the Career Compass
const STRUCTURED_COMPASS_PROMPT = `Generate a structured JSON object with comprehensive career analysis data based on the resume.

IMPORTANT: This system supports ALL career fields, not just IT or Computer Science. Adapt your analysis to the specific industry and career path evident in the resume.

IF the resume lacks very basic data of skills and education:
1. ONLY generate the "resumeImprovement" section
2. Do NOT generate other sections
3. Focus on explaining what essential information is missing and how to add it

{
  "candidateProfile": {
    "coreCompetencies": {
      "technicalSkills": ["list of key technical skills, tools, methodologies"],
      "softSkills": ["list of soft skills like communication, leadership, teamwork"],
      "mostUsedSkill": [
        "Skill 1",
        "Skill 2",
        "Skill 3"
        // Only 3 or 4 skills should be listed here
      ],
      "uniqueValueProposition": "what makes the candidate distinct and valuable in the job market",
      "certifications": ["list of certifications if any, with dates if provided"]
    },
    "workExperience": {
      "totalProfessionalTenure": "summary of years by role/industry",
      "seniorityLevel": "junior, mid-level, senior, executive, etc. based on experience",
      "industryTransferPotential": ["list of industries where skills transfer"],
      "keyAccomplishments": ["list of major achievements from work history"],
      "projectManagementExperience": "description of project management experience if any",
      "teamSizeManaged": "indication of team management experience if applicable",
      "mostImpactfulProject": {
        "title": "project name",
        "description": "brief description",
        "impact": "measurable outcomes, metrics, ROI",
        "relevance": "to career goals",
        "technologies": ["technologies used in this project"]
      },
      "remoteWorkExperience": "experience with remote/distributed teams if any",
      "internationalExperience": "global/international work experience if any"
    },
    "education": {
      "highestDegree": "highest level of education attained",
      "relevantCoursework": ["courses relevant to career goals"],
      "academicAchievements": ["notable academic accomplishments"],
      "degreeUtilization": ["possible applications of degree to careers"],
      "certificationOpportunities": ["suggested certifications based on skills"],
      "continuingEducation": ["recent coursework or ongoing learning"],
      "emergingTechAlignment": ["emerging technologies relevant to candidate"]
    },
    "careerProgression": {
      "growthTrajectory": "analysis of career progression speed and direction",
      "promotionHistory": "pattern of advancement in previous roles",
      "gapAnalysis": ["skill or experience gaps for desired roles"],
      "transitionReadiness": "assessment of readiness for career change if applicable"
    }
  },
  "jobRecommendations": [
    // IMPORTANT: Generate 4-7 job recommendations total, not just one
    // LEAVE THIS ARRAY EMPTY if the resume lacks basic data
    {
      "roleTitle": "job title",
      "experienceLevel": "entry/mid/senior",
      "industryFocus": "primary industry for this role",
      "workplaceType": "remote/hybrid/onsite preferences",
      "assessment": {
        "skillsMatch": ["matching skills"],
        "skillGaps": ["skills needed for this role that candidate lacks"],
        "experienceMatch": "experience alignment description",
        "educationMatch": "education relevance description",
        "cultureFit": "alignment with typical culture for this role"
      },
      "salaryBenchmarks": {
        "description": "For more accurate salary estimates, consider using the following resources:",
        "links": [
          {
            "platform": "Glassdoor or Payscale",
            "searchQuery": "search query text",
            "url": "direct URL to search"
          }
        ]
      },
      "growthPotential": {
        "marketDemand": "expected job growth rate",
        "upwardMobility": "promotion potential"
      },
      "currentOpportunities": [
        // IMPORTANT: Include exactly 4 platforms with searchable links
        {
          "platform": "LinkedIn, Glassdoor, Indeed, etc.",
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
        "requiredSteps": ["certifications", "additional experience needed"],
        "timelineEstimate": "estimated time to achieve next level"
      },
      "randomForestInsights": "explanation of how the model matched this role",
      "workLifeBalance": "typical work-life balance for this role"
    }
  ],
  "overallEvaluation": {
    "jobFitScores": {
      "jobTitle": "percentage as number"
    },
    "marketPositioning": {
      "competitiveAdvantages": ["candidate's strongest competitive advantages"],
      "improvementAreas": ["areas that would strengthen marketability"]
    },
    "interviewReadiness": {
      "commonQuestions": ["likely interview questions based on roles"],
      "suggestedTalking Points": ["key experiences to highlight"]
    },
    "personalBrandingSuggestions": ["ways to strengthen professional presence"]
  },
  // Add this section when the resume lacks basic information
  "resumeImprovement": {
    "overallAssessment": "brief assessment of how incomplete the resume is",
    "missingElements": ["list of critical information that's missing from the resume"],
    "formattingIssues": ["any issues with layout, organization, or presentation"],
    "contentWeaknesses": ["areas where the content could be strengthened"],
    "actionableSteps": [
      "specific steps to improve the resume",
      "format guidance",
      "content recommendations",
      "key sections to add or expand"
    ],
    "professionalResourceLinks": [
      {
        "title": "Resource title",
        "description": "Brief description of how this resource helps",
        "link": "URL to helpful resource"
      }
    ]
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
      const response = await generateObject({
        model,
        output: 'no-schema',
        messages,
      });

      // Return the streaming response
      return response.toJsonResponse();
    }
    // Handle text input (manually entered details or extracted from DOCX)
    else if (text) {
      // Generate streaming object response with text input
      const response = await generateObject({
        model,
        output: 'no-schema',
        prompt: `${STRUCTURED_COMPASS_PROMPT}\n\nAnalyze the resume for structured object generation:\n${text}`,
      });

      // Return the streaming response
      return response.toJsonResponse();
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