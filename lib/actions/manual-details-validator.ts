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
 * Validates if the provided content contains valid educational credentials and skills
 * @param text Text content containing user's educational background and skills
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
            Analyze the following text that contains educational credentials and skills information. 
            Determine if it contains sufficient information for career analysis. The text should include:
            
            1. At least some educational background details (degree, courses, certification, etc.)
            2. At least some skills information

            Only respond with "VALID" if the text contains sufficient information for both education and skills, 
            or "INVALID: [reason]" if the information is insufficient.

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
        console.error('Error validating credentials:', error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Failed to validate credentials'
        };
    }
}
