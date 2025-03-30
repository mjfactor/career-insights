"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Trees, FileText, Sparkles } from "lucide-react"
import React from "react"

export default function StructuredDataPlaceholder() {
    return (
        <div className="relative p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-primary/20 overflow-hidden">
            {/* Background circuit pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="currentColor" fill="none" strokeWidth="0.5">
                        <path d="M 100,100 L 200,100 L 200,200" className="animate-draw-line"></path>
                        <path d="M 300,200 L 400,200 L 400,300" className="animate-draw-line-delay"></path>
                        <path d="M 500,100 L 600,100 L 600,300 L 500,300" className="animate-draw-line-delay-2"></path>
                        <path d="M 700,200 C 750,100 800,300 850,200" className="animate-draw-line"></path>
                    </g>
                </svg>
            </div>

            {/* Glowing orb backgrounds */}
            <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-green-500/10 blur-xl animate-pulse-slower"></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-xl animate-pulse-slow"></div>

            {/* Header with pulsing dot */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <h3 className="text-sm font-medium text-green-500">Processing Resume Data</h3>
            </div>

            <h2 className="text-xl font-bold mb-3">Building Your Career Profile</h2>
            <p className="text-muted-foreground text-sm mb-6">
                Our AI is analyzing your resume to create structured data for a comprehensive career assessment...
            </p>

            {/* Animated progress steps */}
            <div className="space-y-6 relative z-10">
                <ProgressStep
                    icon={<FileText className="h-4 w-4" />}
                    label="Extracting resume information"
                    delay={0}
                    duration={1.5}
                />

                <ProgressStep
                    icon={<Trees className="h-4 w-4" />}
                    label="Processing with Random Forest model"
                    delay={1.2}
                    duration={1.8}
                />

                <ProgressStep
                    icon={<BrainCircuit className="h-4 w-4" />}
                    label="Applying LLM enrichment"
                    delay={2.2}
                    duration={1.5}
                />

                <ProgressStep
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Generating career insights"
                    delay={3.0}
                    duration={1.7}
                />
            </div>

            {/* Animated progress bar */}
            <div className="mt-8 relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    animate={{
                        width: ["0%", "30%", "60%", "85%", "92%"],
                        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                />
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
                This usually takes 15-30 seconds depending on the complexity of your resume
            </p>
        </div>
    )
}

// Animated step component with staggered animation
function ProgressStep({
    icon,
    label,
    delay,
    duration
}: {
    icon: React.ReactNode
    label: string
    delay: number
    duration: number
}) {
    return (
        <div className="flex items-center gap-3">
            <motion.div
                className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay * 0.3, duration: 0.4 }}
            >
                <motion.div
                    className="text-primary"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delay * 0.3
                    }}
                >
                    {icon}
                </motion.div>
            </motion.div>

            <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay * 0.3 + 0.1, duration: 0.4 }}
            >
                <motion.div
                    className="h-5 flex items-center"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delay * 0.3
                    }}
                >
                    <span className="text-sm">{label}</span>
                </motion.div>

                <motion.div
                    className="mt-1 h-1 rounded-full bg-primary/10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay * 0.3 + 0.2 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-green-500/60 to-blue-500/60 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: delay * 0.3
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}