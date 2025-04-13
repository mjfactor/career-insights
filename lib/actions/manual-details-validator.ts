"use server";

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// ==========================================
// Type Definitions
// ==========================================
type ValidationResult = {
    isValid: boolean;
    message?: string;
    error?: string;
};

/**
 * Validates if the provided content contains sufficient education and skills information
 * @param text Text content containing user's education, skills, and optional additional information
 * @returns Validation result with isValid flag
 */
export async function validateResumeText(text: string): Promise<ValidationResult> {
    try {
        // Check for missing content early
        if (!text || text.trim() === '') {
            return {
                isValid: false,
                error: 'No content provided for validation'
            };
        }

        // Prepare the validation prompt
        const prompt = `
            Analyze the following text that contains professional background information. 
            Determine if it contains sufficient information for a basic career analysis.
            
            For a valid submission, the text MUST include:
            1. Education information (degree, diploma, or qualification)
            2. Skills information (at least 2-5 relevant skills)
            
            Any additional personal information is optional and not required for validation.

            Only respond with "VALID" if the text contains sufficient education and skills information, 
            or "INVALID: [reason]" if either education or skills information is missing or too vague.

            Text to analyze:
            ${text}
        `;

        // Generate AI response
        const result = await generateText({
            model: google('gemini-2.0-flash-lite'),
            prompt
        });

        // Process and return results
        const isValid = result.text.toLowerCase().includes('valid') && !result.text.toLowerCase().includes('invalid');
        return {
            isValid,
            message: result.text.trim()
        };
    } catch (error) {
        console.error('Error validating professional information:', error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Failed to validate professional information'
        };
    }
}
