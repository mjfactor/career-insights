"use server";

import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Schema for validation
const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
});

async function saltAndHashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function signUp(formData: FormData | { name: string; email: string; password: string }) {
    try {
        // Handle both FormData and direct object inputs
        const rawInput = formData instanceof FormData
            ? {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string
            }
            : formData;

        // Validate input
        const validatedData = SignupSchema.safeParse(rawInput);

        if (!validatedData.success) {
            return {
                error: "Invalid registration data",
                success: false,
                validationErrors: validatedData.error.format()
            };
        }

        const { name, email, password } = validatedData.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return {
                error: "A user with this email already exists",
                success: false
            };
        }

        // Hash password
        const hashedPassword = await saltAndHashPassword(password);

        // Create user in database with emailVerified set to null (unverified)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: null // Explicitly set as unverified
            }
        });

        // Create verification token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        });

        // Base URL for verification link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

        // Send verification email using the dedicated API route
        const emailResponse = await fetch(`${baseUrl}/api/email/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name,
                verificationUrl
            }),
        });

        if (!emailResponse.ok) {
            console.error('Failed to send verification email:', await emailResponse.text());
        }

        // Return success response (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            message: "Account created successfully. Please check your email to verify your account.",
            success: true,
            requiresVerification: true
        };
    } catch (error) {
        console.error("Signup error:", error);
        return {
            error: "An error occurred during registration",
            success: false
        };
    }
}

// Function to verify email with token
export async function verifyEmail(token: string, email: string) {
    try {
        // Find the verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: email,
                    token
                }
            }
        });

        // If token doesn't exist or has expired
        if (!verificationToken || verificationToken.expires < new Date()) {
            return {
                error: "Invalid or expired verification token",
                success: false
            };
        }

        // Update user's emailVerified field
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() }
        });

        // Delete the used verification token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token
                }
            }
        });

        return {
            message: "Email verified successfully. You can now log in.",
            success: true
        };
    } catch (error) {
        console.error("Email verification error:", error);
        return {
            error: "An error occurred during email verification",
            success: false
        };
    }
}