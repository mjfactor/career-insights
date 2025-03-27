"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

// Schema for password reset validation
const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [token, setToken] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Get token and email from URL query parameters
    useEffect(() => {
        const token = searchParams?.get('token')
        const email = searchParams?.get('email')

        if (!token || !email) {
            setError("Invalid or missing reset token. Please request a new password reset link.")
            return
        }

        setToken(token)
        setEmail(email)
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setErrors({})
        setIsSubmitting(true)

        try {
            // Validate form data
            const validatedData = resetPasswordSchema.parse({
                password,
                confirmPassword,
            })

            if (!token || !email) {
                setError("Invalid or missing reset token. Please request a new password reset link.")
                setIsSubmitting(false)
                return
            }

            // Call the reset password API
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    email,
                    password: validatedData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to reset password")
                setIsSubmitting(false)
                return
            }

            // Show success message
            setSuccess(data.message || "Password reset successfully. You can now log in with your new password.")
            setIsSubmitting(false)

            // Redirect to login page after a delay
            setTimeout(() => {
                router.push("/")
            }, 3000)
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {}
                error.errors.forEach((err) => {
                    if (err.path) {
                        fieldErrors[err.path[0]] = err.message
                    }
                })
                setErrors(fieldErrors)
            } else if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("An unexpected error occurred. Please try again.")
            }
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950">
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                        <p className="text-zinc-400">
                            Enter your new password below.
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="border-red-800 bg-red-950 text-red-500">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-800 bg-green-950 text-green-500">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {!token || !email ? (
                        <div className="text-center mt-6">
                            <Link href="/forgot-password" className="text-green-500 hover:text-green-400">
                                Request a new password reset link
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm text-zinc-300">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm text-zinc-300">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">
                                            {showConfirmPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={isSubmitting || success !== null}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Resetting Password...
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center text-sm text-green-500 hover:text-green-400">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}