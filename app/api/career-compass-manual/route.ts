import { smoothStream, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

// Career compass prompt template for formatting structured data as markdown
const STRUCTURED_TO_MARKDOWN_PROMPT = `

# Job Recommendations
**IMPORTANT: DONT USE CODEBLOCKS, JUST PLAIN TEXT MARKDOWN**

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

### 🤖 AI Analysis Insights
- Include the AI analysis explanation

---
## 3. Overall Evaluation

### 📊 Job Fit Score Per Role
Format as:
- Job Title: Percentage
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
            const model = google('gemini-2.0-flash-lite');

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