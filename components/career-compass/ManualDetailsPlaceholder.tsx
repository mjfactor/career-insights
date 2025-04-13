"use client"

import { motion } from "framer-motion"
import { FileText, BrainCircuit, CheckCircle, ClipboardCheck, Lightbulb } from "lucide-react"
import React, { useState, useEffect } from "react"

export default function ManualDetailsPlaceholder() {
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)

    // Total steps in the process
    const totalSteps = 4

    // Duration for each step in seconds (total ~15-20 seconds)
    const stepDuration = 3

    useEffect(() => {
        // Function to advance to next step
        const advanceStep = () => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep(prev => prev + 1)
            }
        }

        // Set up timer to advance steps
        const timer = setTimeout(() => {
            advanceStep()
        }, stepDuration * 1000)

        // Update progress based on current step
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const stepProgress = (currentStep * 100 / totalSteps)
                const maxProgress = ((currentStep + 1) * 100 / totalSteps)

                if (prev < maxProgress) {
                    return Math.min(prev + 0.3, maxProgress) // Faster increment for a quicker sense of progress
                }
                return prev
            })
        }, 50)

        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
        }
    }, [currentStep])

    // Define steps data - specific to manual details flow
    const steps = [
        {
            icon: <FileText className="h-4 w-4" />,
            label: "Processing your entered details"
        },
        {
            icon: <ClipboardCheck className="h-4 w-4" />,
            label: "Analyzing professional background"
        },
        {
            icon: <BrainCircuit className="h-4 w-4" />,
            label: "Identifying career opportunities"
        },
        {
            icon: <Lightbulb className="h-4 w-4" />,
            label: "Generating personalized insights"
        }
    ]

    return (
        <div className="relative p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-primary/20 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="currentColor" fill="none" strokeWidth="0.5">
                        <path d="M 50,50 L 150,50 L 150,150" className="animate-draw-line"></path>
                        <path d="M 250,150 L 350,150 L 350,250" className="animate-draw-line-delay"></path>
                        <path d="M 450,50 L 550,50 L 550,250 L 450,250" className="animate-draw-line-delay-2"></path>
                    </g>
                </svg>
            </div>

            {/* Glowing backgrounds */}
            <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-xl animate-pulse-slower"></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-green-500/10 blur-xl animate-pulse-slow"></div>

            {/* Header with pulsing dot */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <h3 className="text-sm font-medium text-primary">Analyzing Your Details</h3>
            </div>

            <h2 className="text-xl font-bold mb-3">Creating Your Career Profile</h2>
            <p className="text-muted-foreground text-sm mb-6">
                Our AI is analyzing your professional details to generate personalized career insights...
            </p>

            {/* Sequential progress steps */}
            <div className="space-y-6 relative z-10">
                {steps.map((step, index) => (
                    <SequentialProgressStep
                        key={index}
                        icon={step.icon}
                        label={step.label}
                        isActive={index === currentStep}
                        isCompleted={index < currentStep}
                        isUpcoming={index > currentStep}
                        duration={stepDuration - 0.2} // Slightly shorter than step change time
                    />
                ))}
            </div>

            {/* Animated progress bar */}
            <div className="mt-8 relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
                This process is usually quicker than resume analysis, typically taking around 15-20 seconds
            </p>
        </div>
    )
}

// Sequential progress step component
function SequentialProgressStep({
    icon,
    label,
    isActive,
    isCompleted,
    isUpcoming,
    duration
}: {
    icon: React.ReactNode
    label: string
    isActive: boolean
    isCompleted: boolean
    isUpcoming: boolean
    duration: number
}) {
    return (
        <div className="flex items-center gap-3">
            <motion.div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${isCompleted
                    ? "bg-primary/20"
                    : isActive
                        ? "bg-primary/20"
                        : "bg-primary/5"
                    }`}
                animate={{
                    scale: isActive ? [1, 1.05, 1] : 1,
                    transition: {
                        repeat: isActive ? Infinity : 0,
                        duration: 1.5
                    }
                }}
            >
                <motion.div
                    className={`${isCompleted
                        ? "text-primary"
                        : isActive
                            ? "text-primary"
                            : "text-muted-foreground/50"
                        }`}
                    animate={{
                        opacity: isActive ? [0.7, 1, 0.7] : isCompleted ? 1 : 0.5
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : icon}
                </motion.div>
            </motion.div>

            <motion.div
                className="flex-1"
                animate={{
                    opacity: isUpcoming ? 0.5 : 1
                }}
            >
                <motion.div
                    className="h-5 flex items-center"
                    animate={{
                        opacity: isActive ? [0.8, 1, 0.8] : 1
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    <span className={`text-sm ${isUpcoming ? "text-muted-foreground/50" : ""}`}>{label}</span>
                </motion.div>

                <motion.div
                    className="mt-1 h-1 rounded-full bg-primary/10 overflow-hidden"
                >
                    <motion.div
                        className={`h-full rounded-full ${isCompleted
                            ? "bg-primary"
                            : "bg-gradient-to-r from-primary/60 to-blue-500/60"
                            }`}
                        animate={{
                            width: isCompleted
                                ? "100%"
                                : isActive
                                    ? ["0%", "100%"]
                                    : "0%"
                        }}
                        transition={{
                            duration: isActive ? duration : 0,
                            ease: "easeInOut",
                            repeat: 0
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
} 