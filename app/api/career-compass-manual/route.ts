import { smoothStream, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

// Career compass prompt template for formatting structured data as markdown
const STRUCTURED_TO_MARKDOWN_PROMPT = `

# Job Recommendations
**IMPORTANT: If the JSON contains a "resumeImprovement" section instead of job recommendations, SKIP this entire section and jump to "Resume Improvement Guidance" below**

For each role, format as follows:

## [Role Title] + Experience Level

| Assessment Metric     | Details |
|-----------------------|---------|
| 🔍 Skills Match       | List the matching skills |
| 👤 Experience Match   | Show the experience alignment |
| 📖 Education Match    | Show the education relevance |
| 🏭 Industry Focus     | Specify the primary industry for this position |

### 💵 Salary Benchmarks
  For more accurate salary estimates, consider using the following resources
  - List the links

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
## Resume Improvement Guidance
**ONLY INCLUDE THIS SECTION when the JSON contains a "resumeImprovement" section**

### 📝 Resume Assessment
- Overall assessment of the resume's current state
- Critical missing elements
- Formatting and presentation issues

### 🚩 Content Weaknesses
- List specific areas where content could be strengthened
- Examples of vague statements that could be made more concrete
- Missing quantifiable achievements

### ✅ Actionable Steps to Improve
- Format each step clearly as a numbered list
- Include specific guidance for improving each section
- Provide examples of stronger resume content where possible

### 📚 Professional Resources
Format resources as links:
- [Resource Title](Link) - Brief description
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