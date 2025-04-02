import { smoothStream, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

// Career compass prompt template for formatting structured data as markdown
const STRUCTURED_TO_MARKDOWN_PROMPT = `
Take the provided structured JSON career analysis data and convert it to a well-formatted markdown document.
Format the information exactly according to these rules:

**STRICT PROCESSING ORDER (DO NOT SKIP):**
1. Format the Candidate Profile Analysis FIRST
2. ONLY THEN proceed to Job Recommendations
3. Confirm all profile analysis sections are complete before continuing.

---

# 1. Candidate Profile Analysis

## A. Core Competency Identification
- 🏅 **Technical Strengths**: List the technical strengths from the data
- 📊 **Skill Frequency Analysis**: Format the skill frequency data as a list with percentages
- 🧩 **Unique Value Proposition**: Present the unique value proposition
- 🎗️ **Certifications**: List all certifications, or indicate if none

## B. Work Experience Summary
- ⏳ **Total Professional Tenure Breakdown**: Show the tenure summary by role/industry
- 🔀 **Multi-Industry Transfer Potential**: List industries where skills transfer
- 📌 **Highlight: Most Impactful Project/Initiative**: Describe the project with its impact and relevance

## C. Educational Pathway Analysis
- 🎓 **Degree Utilization Spectrum**: Show applications of degree to careers
- 📜 **Certification Opportunities**: List recommended certifications
- 🌐 **Emerging Tech Alignment**: List emerging technologies relevant to the candidate

---
# 2. Job Recommendations
For each role, format as follows:

## [Role Title] + Experience Level

| Assessment Metric     | Details |
|-----------------------|---------|
| 🔍 Skills Match       | List the matching skills |
| 👤 Experience Match   | Show the experience alignment |
| 📖 Education Match    | Show the education relevance |

### 💵 Salary Benchmarks
- Present the salary range and factors

### 🔗 Current Opportunities
- Format each opportunity as a markdown link with the platform name:
  - [Platform: Search Query](URL)

### 📚 Skill Development
Format exactly as follows:

| Tutorial Title       | Description                          | Duration | Link |
|----------------------|--------------------------------------|----------|------|
| Course name          | Skills covered                       | Duration | URL  |

### 🌟 Career Path Projections
- List the potential career paths and Include required steps

### 🎲 Random Forest Insights
- Include the random forest explanation

---
## 3. Overall Random Forest Data Evaluation

### Overall Job Fit Score Per Role
Format as:
- Job Title: Percentage

---
**Formatting Rules:**
1. Table must:
   - Use pipe formatting with headers.
   - Keep descriptions under 25 words.
   - Show durations as Xh Ym.
2. Order Enforcement:
   - Profile Analysis → Job Recommendations → Overall Random Forest Data Evaluation.
3. Link Rules:
   - Clean formatting: [Display Text](URL).
   - No broken links.
4. Language:
   - Ensure language is clear and accessible. Avoid overly technical terms unless necessary, and define them if used.
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