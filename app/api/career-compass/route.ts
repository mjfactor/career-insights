import { smoothStream, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

// Career compass prompt template for formatting structured data as markdown
const STRUCTURED_TO_MARKDOWN_PROMPT = `
Take the provided structured JSON career analysis data and convert it to a well-formatted markdown document.
Format the information exactly according to these rules:

IMPORTANT: DONT USE CODEBLOCKS, JUST PLAIN TEXT MARKDOWN

**STRICT PROCESSING ORDER (DO NOT SKIP):**
1. Format the Candidate Profile Analysis FIRST
2. ONLY THEN proceed to Job Recommendations
3. Confirm all profile analysis sections are complete before continuing.

---

# 1. Candidate Profile Analysis

## A. Core Competency Identification
- 🧰 **Technical Strengths**: List the technical strengths from the data
- 🤝 **Soft Skills**: List the soft skills identified in the resume
- 📊 **Most Used Skills**: Format the most used skill 
- 🧩 **Unique Value Proposition**: Present the unique value proposition
- 🎗️ **Certifications**: List all certifications, or indicate if none

## B. Work Experience Summary
- ⏳ **Total Professional Tenure Breakdown**: Show the tenure summary by role/industry
- 🔼 **Seniority Level Assessment**: Indicate the candidate's career level
- 🔀 **Multi-Industry Transfer Potential**: List industries where skills transfer
- 🏆 **Key Accomplishments**: Highlight notable achievements from work history
- 👥 **Team Leadership Experience**: Mention team size managed if applicable
- 🌐 **Remote/International Experience**: Note any remote or global work experience
- 📌 **Highlight: Most Impactful Project/Initiative**: Describe the project with its impact, relevance and technologies used

## C. Educational Pathway Analysis
- 🎓 **Highest Degree**: State the highest level of education attained
- 📚 **Relevant Coursework**: List courses that align with career goals
- 🏆 **Academic Achievements**: Mention notable educational accomplishments
- 🔄 **Degree Utilization Spectrum**: Show applications of degree to careers
- 📜 **Certification Opportunities**: List recommended certifications
- 🌱 **Continuing Education**: Note recent learning or ongoing education
- 🌐 **Emerging Tech Alignment**: List emerging technologies relevant to the candidate

## D. Career Progression Assessment
- 📈 **Growth Trajectory**: Analyze career progression speed and direction
- 🪜 **Promotion History**: Describe advancement patterns in previous roles
- 🔍 **Gap Analysis**: Identify skill or experience gaps for desired roles
- 🔄 **Transition Readiness**: Assess readiness for career change if applicable

---
# 2. Job Recommendations
For each role, format as follows:

## [Role Title] + Experience Level

| Assessment Metric     | Details |
|-----------------------|---------|
| 🔍 Skills Match       | List the matching skills |
| 🚫 Skill Gaps         | List skills needed but not yet acquired |
| 👤 Experience Match   | Show the experience alignment |
| 📖 Education Match    | Show the education relevance |
| 🏢 Culture Fit        | Indicate alignment with typical organizational culture |
| 💼 Workplace Type     | Note remote/hybrid/onsite nature of the role |
| 🏭 Industry Focus     | Specify the primary industry for this position |

### 💵 Salary Benchmarks
- Present the salary range and median
- List the factors affecting compensation (location, experience, etc.)

### 📈 Growth Potential
- Market Demand: Specify the expected job growth rate
- Upward Mobility: Describe promotion potential

### 🔗 Current Opportunities
- Format each opportunity as a markdown link with the platform name:
- [Platform: Search Query](URL)

### 📚 Skill Development
Format exactly as follows:

| Tutorial Title       | Description                          | Duration | Link |
|----------------------|--------------------------------------|----------|------|
| Course name          | Skills covered                       | Duration | URL  |

### 🌟 Career Path Projections
- List the potential career paths
- Include required steps
- Note estimated timeline to achieve the next level

### ⚖️ Work-Life Balance
- Describe typical work-life balance for this role

### 🎲 Random Forest Insights
- Include the random forest explanation

---
## 3. Overall Evaluation

### 📊 Job Fit Score Per Role
Format as:
- Job Title: Percentage

### 💪 Market Positioning
- **Competitive Advantages**: List the candidate's strongest selling points
- **Improvement Areas**: Note areas that would strengthen marketability

### 🎯 Interview Readiness
- **Common Questions**: List likely interview questions
- **Suggested Talking Points**: Key experiences to highlight

### 🌐 Personal Branding Suggestions
- Ways to strengthen professional presence

---
**Formatting Rules:**

1. Table must:
   - Use pipe formatting with headers.
   - Keep descriptions under 25 words.
   - Show durations as Xh Ym.
2. Order Enforcement:
   - Profile Analysis → Job Recommendations → Overall Evaluation.
3. Link Rules:
   - Clean formatting: [Display Text](URL).
4. Language:
   - Use professional, clear, concise language.
   - Be specific with percentages and numbers.
   - Avoid platitudes and general advice.
   - Use action verbs for achievements.
5. Emoji Usage:
   - Begin each major section with an appropriate emoji.
   - Consistent emoji use for similar section types.
`;



export async function POST(request: NextRequest) {
  try {
    // First try to get structured data from request
    let structuredData = null;

    // Check if request is JSON (contains structured data)
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const requestData = await request.json();
        if (requestData.structuredData) {
          structuredData = requestData.structuredData;
        }
      } catch (error) {
        console.error('Error parsing JSON request:', error);
      }
    }

    // If we have structured data, process it to generate markdown
    if (structuredData) {
      // Initialize the model
      const model = google('gemini-2.0-flash');

      // Generate streaming markdown response using structured data
      const response = streamText({
        model,
        prompt: `${STRUCTURED_TO_MARKDOWN_PROMPT}\n\nSTRUCTURED DATA TO FORMAT:\n${JSON.stringify(structuredData, null, 2)}`,
        experimental_transform: smoothStream()
      });

      // Return the streaming response
      return response.toTextStreamResponse();
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