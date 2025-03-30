"use server";

import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Create a nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Create HTML template for verification email
function createVerificationEmailHTML(name: string, verificationUrl: string) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #333; text-align: center;">Welcome to Employment Opportunities!</h1>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">Hello ${name},</p>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">
        Thank you for registering. Please click the button below to verify your email address:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${verificationUrl}"
          style="background-color: #22c55e; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;"
        >
          Verify my email
        </a>
      </div>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">
        This link will expire in 24 hours.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
  `;
}

// Create plain text version for email clients that don't support HTML
function createVerificationEmailText(name: string, verificationUrl: string) {
    return `
    Welcome to Employment Opportunities!
    
    Hello ${name},
    
    Thank you for registering. Please visit the following link to verify your email address:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create this account, you can safely ignore this email.
  `;
}

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
        const baseUrl = process.env.NEXTAUTH_URL || 'https://employment-opportunities.vercel.app';
        const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

        try {
            // Send the verification email directly instead of using the API route
            const mailOptions = {
                from: `"Employment Opportunities" <${process.env.GMAIL_EMAIL_ADDRESS}>`,
                to: email,
                subject: 'Verify your email address',
                text: createVerificationEmailText(name, verificationUrl),
                html: createVerificationEmailHTML(name, verificationUrl),
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the signup if email sending fails
            // The token is already in the database and the user can still sign up
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