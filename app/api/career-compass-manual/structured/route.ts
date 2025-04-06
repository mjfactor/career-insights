import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { CandidateAnalysisManualSchema } from '@/lib/schema/career-compass-schema-manual';
// Structured object generation prompt that extracts the same data points as the Career Compass
const STRUCTURED_COMPASS_PROMPT = `Generate a structured JSON object with comprehensive career analysis data based on the input credentials.
IMPORTANT: This system supports ALL career fields, not just IT or Computer Science. Adapt your analysis to the specific industry and career path evident in the resume.

Include at least 4 job recommendations that match the candidate's skills and experience.`;

/**
 * Repairs malformed JSON by applying a series of fixes to common syntax errors
 * @param text The potentially malformed JSON string
 * @param error The error message from the JSON parsing failure
 * @returns A repaired JSON string or "{}" if repair fails
 */
async function repairJson(text: string, error: any): Promise<string> {
  if (!text) return "{}";
  console.log(error);

  try {
    // Try to parse the JSON to identify issues
    JSON.parse(text);
    return text; // If it parses successfully, return as is
  } catch (parseError: any) {
    console.log("JSON parse error:", parseError.message);

    // Common JSON syntax issues and their fixes
    let repaired = text;

    // 1. Fix trailing commas in arrays/objects
    repaired = repaired.replace(/,(\s*[\]}])/g, "$1");

    // 2. Fix mismatched closing brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      repaired = repaired + "}".repeat(openBraces - closeBraces);
    }

    // 3. Fix missing opening brackets (rare but possible)
    if (closeBraces > openBraces) {
      repaired = "{".repeat(closeBraces - openBraces) + repaired;
    }

    // 4. Fix issue with missing commas between objects
    repaired = repaired.replace(/\}(\s*\{)/g, "},$1");

    // 5. Fix issue with comma after closing brackets
    repaired = repaired.replace(/\}([^,\}\]])/g, "},$1");

    // 6. Balance array brackets
    const openArrays = (repaired.match(/\[/g) || []).length;
    const closeArrays = (repaired.match(/\]/g) || []).length;
    if (openArrays > closeArrays) {
      repaired = repaired + "]".repeat(openArrays - closeArrays);
    }
    if (closeArrays > openArrays) {
      repaired = "[".repeat(closeArrays - openArrays) + repaired;
    }

    // 7. Fix unquoted property names (common in LLM outputs)
    repaired = repaired.replace(/(\{|\,)\s*([a-zA-Z0-9_]+)\s*\:/g, '$1"$2":');

    // 8. Fix single-quoted strings (convert to double quotes)
    repaired = repaired.replace(/(\w+):'([^']*)'/g, '$1:"$2"');

    // 9. Fix missing quotes around string values
    repaired = repaired.replace(/:\s*([a-zA-Z][a-zA-Z0-9_\s]*[a-zA-Z0-9_])(\s*[,\}])/g, ':"$1"$2');

    // 10. Fix double commas
    repaired = repaired.replace(/,,/g, ',');

    // 11. Fix trailing commas in objects and arrays
    repaired = repaired.replace(/,\s*\}/g, '}');
    repaired = repaired.replace(/,\s*\]/g, ']');

    // 12. Handle truncated JSON specifically - identify structure and attempt to properly close it
    if (parseError.message.includes("Unexpected end of JSON input") ||
      parseError.message.includes("Expected") ||
      parseError.message.includes("Unterminated")) {
      try {
        // Analyze structure to determine what's missing
        const lastOpenBrace = repaired.lastIndexOf('{');
        const lastCloseBrace = repaired.lastIndexOf('}');
        const lastOpenBracket = repaired.lastIndexOf('[');
        const lastCloseBracket = repaired.lastIndexOf(']');
        const lastColon = repaired.lastIndexOf(':');
        const lastComma = repaired.lastIndexOf(',');
        const lastQuote = repaired.lastIndexOf('"');

        // Check if truncated in the middle of a string
        const countQuotes = (repaired.match(/"/g) || []).length;
        if (countQuotes % 2 !== 0) {
          // If odd number of quotes, we have an unclosed string
          repaired = repaired + '"';
        }

        // Check if truncated after a colon (expecting a value)
        if (lastColon > lastComma && lastColon > lastCloseBrace && lastColon > lastCloseBracket) {
          // After a colon we expect a value - provide empty string if truncated
          repaired = repaired + '""';
        }

        // Check if truncated after a comma (expecting another property or value)
        if (lastComma > lastCloseBrace && lastComma > lastCloseBracket &&
          lastComma > lastOpenBrace && lastComma > lastOpenBracket) {
          // Determine if we're in an object or array to close properly
          let depth = 0;
          let isInArray = false;

          for (let i = repaired.length - 1; i >= 0; i--) {
            const char = repaired[i];
            if (char === '}') depth++;
            else if (char === '{') {
              depth--;
              if (depth < 0) {
                isInArray = false;
                break;
              }
            }
            else if (char === ']') depth++;
            else if (char === '[') {
              depth--;
              if (depth < 0) {
                isInArray = true;
                break;
              }
            }
          }

          // Add appropriate closure based on context
          if (isInArray) {
            repaired = repaired + 'null';
          } else {
            repaired = repaired + '"property":"value"';
          }
        }

        // Try advanced recovery of specific position errors
        if (parseError.message.includes("position")) {
          // Extract position from error message
          const posMatch = parseError.message.match(/position\s+(\d+)/);
          if (posMatch && posMatch[1]) {
            const errorPos = parseInt(posMatch[1]);

            // Check 20 characters before error position to determine context
            const contextStart = Math.max(0, errorPos - 20);
            const contextEnd = Math.min(repaired.length, errorPos + 1);
            const errorContext = repaired.substring(contextStart, contextEnd);

            // Look for patterns indicating specific issues
            if (errorContext.includes('":') && !errorContext.includes('":"')) {
              // Missing value after property
              const fixedPart = repaired.substring(0, errorPos) + '""' + repaired.substring(errorPos);
              repaired = fixedPart;
            }

            if (errorContext.includes(',}') || errorContext.includes(', }')) {
              // Trailing comma in object
              repaired = repaired.replace(/,\s*\}/g, '}');
            }

            if (errorContext.includes(',[') || errorContext.includes(', [')) {
              // Starting a new array element after comma
              const fixedPart = repaired.substring(0, errorPos) + 'null' + repaired.substring(errorPos);
              repaired = fixedPart;
            }
          }
        }
      } catch (structureError) {
        console.log("Structure analysis error:", structureError);
        // Continue with standard fixes if structure analysis fails
      }
    }

    // Try to parse the repaired JSON
    try {
      JSON.parse(repaired);
      return repaired;
    } catch (repairError) {
      console.log("First repair attempt failed:", repairError instanceof Error ? repairError.message : String(repairError));

      // Second attempt with more aggressive fixes
      try {
        // Fix missing colons between property name and value
        repaired = repaired.replace(/"([^"]+)"\s+("[^"]+"|\{|\[|true|false|null|-?\d+\.?\d*)/g, '"$1": $2');

        // Fix broken string escaping (common issue with nested quotes)
        repaired = repaired.replace(/([^\\])\\([^"\\/bfnrtu])/g, '$1\\\\$2');

        // Balance all brackets again (more aggressively)
        const finalOpenBraces = (repaired.match(/\{/g) || []).length;
        const finalCloseBraces = (repaired.match(/\}/g) || []).length;

        if (finalOpenBraces > finalCloseBraces) {
          repaired = repaired + "}".repeat(finalOpenBraces - finalCloseBraces);
        } else if (finalCloseBraces > finalOpenBraces) {
          repaired = "{".repeat(finalCloseBraces - finalOpenBraces) + repaired;
        }

        const finalOpenArrays = (repaired.match(/\[/g) || []).length;
        const finalCloseArrays = (repaired.match(/\]/g) || []).length;

        if (finalOpenArrays > finalCloseArrays) {
          repaired = repaired + "]".repeat(finalOpenArrays - finalCloseArrays);
        } else if (finalCloseArrays > finalOpenArrays) {
          repaired = "[".repeat(finalCloseArrays - finalOpenArrays) + repaired;
        }

        // Handle potentially truncated strings at the end
        if (repaired.endsWith('"')) {
          // Check if this is an unclosed string
          const lastQuotePos = repaired.lastIndexOf('"');
          const secondLastQuotePos = repaired.lastIndexOf('"', lastQuotePos - 1);
          if (lastQuotePos - secondLastQuotePos > 1) {
            // This looks like a properly closed string
          } else {
            // Add closing quote
            repaired = repaired + '"';
          }
        }

        // Try to parse again
        JSON.parse(repaired);
        return repaired;
      } catch (finalError) {
        console.log("Second repair attempt failed:", finalError instanceof Error ? finalError.message : String(finalError));

        // Third attempt with extreme measures for truncated content
        try {
          // Truncated JSON often means we need to find the largest complete structure
          // First locate the position of the error
          let errorPosition = -1;
          const positionMatch = finalError instanceof Error &&
            finalError.message.match(/position (\d+)/);

          if (positionMatch && positionMatch[1]) {
            errorPosition = parseInt(positionMatch[1]);
          }

          if (errorPosition > 0) {
            // Get content up to the error position
            const validPart = repaired.substring(0, errorPosition);

            // Find the last complete object or array
            const lastCompleteBrace = validPart.lastIndexOf('}');
            const lastCompleteBracket = validPart.lastIndexOf(']');
            const lastCompletePosition = Math.max(lastCompleteBrace, lastCompleteBracket);

            if (lastCompletePosition > 0) {
              // Take everything up to the last complete structure and properly close
              repaired = validPart.substring(0, lastCompletePosition + 1);

              // Check if we need to close the root object
              if (repaired.trim().startsWith('{') && !repaired.trim().endsWith('}')) {
                repaired = repaired + '}';
              }
            }
          }

          // If we still have malformed JSON at this point, we need to apply extreme measures
          // Try reconstructing only the outer shell of the object
          if (text.startsWith('{') && text.includes('"candidateProfile"')) {
            let minimumValidStructure = '{"candidateProfile":{},"jobRecommendations":[],"overallEvaluation":{}}';

            // Try to extract candidateProfile if possible
            const profileStart = text.indexOf('"candidateProfile"');
            const profileEnd = text.indexOf('"jobRecommendations"');

            if (profileStart > 0 && profileEnd > profileStart) {
              try {
                // Try to get a valid candidateProfile section
                let profileSection = text.substring(profileStart - 1, profileEnd - 1);
                profileSection = profileSection + '}'; // Ensure closing

                // Attempt to parse and use just this section
                try {
                  JSON.parse('{' + profileSection + '}');
                  minimumValidStructure = '{' + profileSection + ',"jobRecommendations":[],"overallEvaluation":{}}';
                } catch (e) {
                  // Keep the minimum structure if parsing fails
                }
              } catch (e) {
                // Use the minimum structure on extraction error
              }
            }

            repaired = minimumValidStructure;
          }

          // Try to parse one more time
          JSON.parse(repaired);
          return repaired;
        } catch (e) {
          console.log("Final extreme repair attempt failed:", e instanceof Error ? e.message : String(e));

          // If all repair attempts fail, return a minimal valid object that matches the expected structure
          return '{"candidateProfile":{},"jobRecommendations":[],"overallEvaluation":{},"resumeImprovement":{"missingElements":["JSON parsing failed - please try again"]}}';
        }
      }
    }
  }
}

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
            text: `${STRUCTURED_COMPASS_PROMPT}\n\nAnalyze the inputted credentials in the attached PDF file for structured object generation:`
          },
          {
            type: 'file' as const,
            data: fileBuffer,
            mimeType: 'application/pdf'
          }
        ]
      }];

      try {
        // Generate streaming object response with file input
        const response = await generateObject({
          model,
          schema: CandidateAnalysisManualSchema,
          messages,
          experimental_repairText: async ({ text, error }) => repairJson(text, error),
        });

        return response.toJsonResponse();
      } catch (objError) {
        console.error('Error generating object from PDF:', objError);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate valid JSON data from the PDF. There might be an issue with the resume format or content.',
            details: objError instanceof Error ? objError.message : 'Unknown error'
          }),
          {
            status: 422,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
    // Handle text input (manually entered details or extracted from DOCX)
    else if (text) {
      try {
        const response = await generateObject({
          model,
          schema: CandidateAnalysisManualSchema,
          prompt: `${STRUCTURED_COMPASS_PROMPT}\n\nAnalyze inputted credentials for structured object generation:\n${text}`,
          experimental_repairText: async ({ text, error }) => repairJson(text, error),
        });

        // Return the streaming response
        return response.toJsonResponse();
      } catch (objError) {
        console.error('Error generating object from text:', objError);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate valid JSON data from the text. Please check the format and content of your resume.',
            details: objError instanceof Error ? objError.message : 'Unknown error'
          }),
          {
            status: 422,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
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