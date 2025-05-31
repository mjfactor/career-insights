"use client"

import { useState, useMemo } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    LineChart,
    Line,
    PieChart,
    Pie
} from "recharts"
import { Check, AlertTriangle, Star, TrendingUp, Target, Clock, Link as LinkIcon, BookOpen, Briefcase, GraduationCap, ListChecks, ExternalLink, Info } from "lucide-react"; // Added Check, AlertTriangle, Star
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Fragment } from "react"; // Import Fragment from react

// Helper function to escape special characters in a string for use in a RegExp
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Define types for career data structure
interface SkillItem {
    name: string;
    value: number;
}

interface JobRecommendation {
    roleTitle: string;
    salaryBenchmarks: {
        range?: string;
        description?: string;
        links?: Array<{
            platform: string;
            searchQuery: string;
            url: string;
        }>;
    };
    skillDevelopment: Array<{
        title?: string;
        description?: string;
        duration: string;
        link?: string;
    }>;
    assessment: {
        skillsMatch: string[];
        skillGaps?: string[];
    };
    growthPotential?: {
        marketDemand: string;
        upwardMobility: string;
    }; workLifeBalance?: string;
    careerPathProjections?: {
        potentialPaths: string[];
        requiredSteps: string[];
        timelineEstimate: string;
    };
}

interface CareerData {
    candidateProfile: {
        coreCompetencies: {
            skillFrequencyAnalysis?: Record<string, number>;
            technicalSkills?: string[];
            technicalStrengths?: string[];
            softSkills?: string[];
            mostUsedSkill?: string[];
            certifications?: string[];
        };
        workExperience?: {
            mostImpactfulProject?: {
                title: string;
                description: string;
                impact: string;
                relevance: string;
                technologies: string[];
            }
        };
        education?: {
            certifications?: string[];
        };
    }; overallEvaluation: {
        marketPositioning?: {
            competitiveAdvantages: string[];
            improvementAreas: string[];
        };
    };
    jobRecommendations: JobRecommendation[];
    resumeImprovement?: {
        overallAssessment: string;
        missingElements: string[];
        contentWeaknesses: string[];
        actionableSteps: string[];
        professionalResourceLinks: Array<{
            title: string;
            description: string;
        }>;
    };
}

type CareerDataVisualizerProps = {
    structuredData?: CareerData;
}

// Custom colors for charts
const CHART_COLORS = {
    skills: "hsl(215, 90%, 60%)",
    skillFrequency: "hsl(260, 70%, 55%)", // Added color for skill frequency
    salary: {
        min: "hsl(210, 80%, 50%)",
        range: "hsl(170, 70%, 50%)"
    },
    development: "hsl(340, 80%, 60%)"
}

export default function CareerDataVisualizer({ structuredData }: CareerDataVisualizerProps) {
    // Use the provided structured data or fall back to sample data
    const [data] = useState<CareerData>(structuredData as CareerData)

    // ==========================================================================

    // Technical Skills Overview
    // ==========================================================================

    const technicalSkills = useMemo(() => {
        return data.candidateProfile.coreCompetencies.technicalStrengths ||
            data.candidateProfile.coreCompetencies.technicalSkills || []
    }, [data])

    // ==========================================================================

    // Soft Skills Overview
    // ==========================================================================

    const softSkills = useMemo(() => {
        return data.candidateProfile.coreCompetencies.softSkills || []
    }, [data])

    // ==========================================================================

    // Certifications
    // ==========================================================================

    const certifications = useMemo(() => {
        // Check both possible locations for certifications data
        return data.candidateProfile.education?.certifications ||
            data.candidateProfile.coreCompetencies?.certifications || []
    }, [data])    // ==========================================================================

    // Skill Development Time Chart Data
    // ==========================================================================

    const skillDevelopmentData = useMemo(() => {
        return data.jobRecommendations.map(job => {
            // Calculate total duration for each job role
            const totalHours = job.skillDevelopment.reduce((acc, skill) => {
                const duration = skill.duration
                const hourMatch = duration.match(/(\d+)h/)
                const hourValue = hourMatch ? parseInt(hourMatch[1]) : 0

                const minuteMatch = duration.match(/(\d+)m/)
                const minuteValue = minuteMatch ? parseInt(minuteMatch[1]) / 60 : 0

                return acc + hourValue + minuteValue
            }, 0)

            return {
                name: job.roleTitle,
                hours: Math.round(totalHours),
            }
        }).sort((a, b) => b.hours - a.hours)
    }, [data])

    const developmentChartConfig = {
        hours: {
            label: "Training Hours",
            color: CHART_COLORS.development,
        },
    } satisfies ChartConfig

    // ==========================================================================

    // Skills Match Table Data
    // ==========================================================================

    // Get unique skills across all job recommendations
    const uniqueSkills = useMemo(() => {
        const skillsSet = new Set<string>()
        data.jobRecommendations.forEach(job => {
            job.assessment.skillsMatch.forEach(skill => skillsSet.add(skill))
        })
        return Array.from(skillsSet)
    }, [data])

    // Create a mapping of job to skills
    const jobSkillsMap = useMemo(() => {
        return data.jobRecommendations.reduce((acc, job) => {
            acc[job.roleTitle] = new Set(job.assessment.skillsMatch)
            return acc
        }, {} as Record<string, Set<string>>)
    }, [data])

    // ==========================================================================
    // Market Positioning Data
    // ==========================================================================
    const marketPositioning = useMemo(() => {
        return data.overallEvaluation.marketPositioning;
    }, [data]);

    return (
        <div className="space-y-8">
            {/* Most Impactful Project Card */}
            {data.candidateProfile.workExperience?.mostImpactfulProject && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Most Impactful Project</CardTitle>
                        <CardDescription>Your most significant project achievement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-primary">
                                {data.candidateProfile.workExperience.mostImpactfulProject.title}
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                {data.candidateProfile.workExperience.mostImpactfulProject.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Impact</h4>
                                <p>{data.candidateProfile.workExperience.mostImpactfulProject.impact}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Relevance</h4>
                                <p>{data.candidateProfile.workExperience.mostImpactfulProject.relevance}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Technologies Used</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.candidateProfile.workExperience.mostImpactfulProject.technologies.map((tech) => (
                                    <Badge
                                        key={tech}
                                        className="bg-primary/20 text-primary hover:bg-primary/30 border-none"
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Certifications Timeline Card */}
            {certifications && certifications.length > 0 && (
                <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <CardHeader>
                        <CardTitle>Certifications Timeline</CardTitle>
                        <CardDescription>Professional certifications achieved</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {/* Vertical timeline line */}
                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/30" />

                            <div className="space-y-6 ml-2">
                                {certifications.map((cert, idx) => {
                                    // Extract year from certification (assuming format includes a year in parenthesis like "Certification Name (2024)")
                                    const yearMatch = cert.match(/\((\d{4})\)$/);
                                    const year = yearMatch ? yearMatch[1] : "";
                                    const certName = yearMatch ? cert.replace(yearMatch[0], "").trim() : cert;

                                    return (
                                        <div key={idx} className="relative pl-8">
                                            {/* Timeline dot */}
                                            <div className="absolute left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-background" />
                                            </div>

                                            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                                <h3 className="font-medium text-foreground">{certName}</h3>
                                                {year && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        Achieved in {year}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Technical Skills Card (Span 2 cols on large screens) */}
                <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Technical Skills</CardTitle>
                        <CardDescription>All identified technical skills</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                        <div className="flex flex-wrap gap-2">
                            {technicalSkills.map((skill) => (
                                <TooltipProvider key={skill}>
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="secondary"
                                                className="px-3 py-1 text-sm font-medium rounded-full shadow-sm max-w-[200px] truncate inline-block break-words"
                                            >
                                                {skill}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs break-words">{skill}</p>
                                        </TooltipContent>
                                    </UITooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Soft Skills Card (Span 1 col on large screens) */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Soft Skills</CardTitle>
                        <CardDescription>All identified soft skills</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                        <div className="flex flex-wrap gap-2">
                            {softSkills.map((skill) => (
                                <TooltipProvider key={skill}>
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="secondary"
                                                className="px-3 py-1 text-sm font-medium rounded-full shadow-sm max-w-[180px] truncate inline-block break-words"
                                            >
                                                {skill}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs break-words">{skill}</p>
                                        </TooltipContent>
                                    </UITooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Market Positioning Card */}
            {marketPositioning && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Market Positioning</CardTitle>
                        <CardDescription>Your competitive standing in the job market</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Competitive Advantages */}
                        {marketPositioning.competitiveAdvantages?.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-md font-semibold flex items-center gap-2 text-green-600">
                                    <Check className="h-5 w-5" />
                                    Competitive Advantages
                                </h3>
                                <ul className="space-y-2 text-sm list-disc pl-5 text-muted-foreground">
                                    {marketPositioning.competitiveAdvantages.map((advantage, idx) => (
                                        <li key={idx}>{advantage}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Improvement Areas */}
                        {marketPositioning.improvementAreas?.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-md font-semibold flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Improvement Areas
                                </h3>
                                <ul className="space-y-2 text-sm list-disc pl-5 text-muted-foreground">
                                    {marketPositioning.improvementAreas.map((area, idx) => (
                                        <li key={idx}>{area}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>)}

            {/* Skills Match Analysis */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Skills Match Analysis</CardTitle>
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Shows which of your skills match each role's requirements</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <CardDescription>
                        Matching skills for each recommended role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto max-h-[400px] rounded-md border">
                        <Table>
                            <TableCaption>Skills that match each role's requirements</TableCaption>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead className="w-[150px] bg-muted/50">Role</TableHead>
                                    {uniqueSkills.map(skill => (
                                        <TableHead
                                            key={skill}
                                            className="whitespace-nowrap text-center bg-muted/50"
                                        >
                                            {skill}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.jobRecommendations.map((job, index) => (
                                    <TableRow
                                        key={job.roleTitle}
                                        className={cn(
                                            index % 2 === 0 ? "bg-background" : "bg-muted/20",
                                            "hover:bg-muted/40 transition-colors"
                                        )}
                                    >
                                        <TableCell className="font-medium">{job.roleTitle}</TableCell>
                                        {uniqueSkills.map(skill => (
                                            <TableCell
                                                key={`${job.roleTitle}-${skill}`}
                                                className="text-center"
                                            >
                                                {jobSkillsMap[job.roleTitle].has(skill) ? (
                                                    <div className="h-4 w-4 rounded-full bg-green-500 mx-auto" />
                                                ) : (
                                                    <span className="block h-4 w-4 mx-auto">-</span>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                    <p>Green circles indicate skills you already possess that match the role</p>
                </CardFooter>
            </Card>            {/* Career Path Projections Visualization */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Career Path Projections</CardTitle>
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Potential career growth paths and required steps</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <CardDescription>
                        Projected career trajectories based on your profile
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6">
                        {data.jobRecommendations.map((job, idx) => {
                            if (!job.careerPathProjections?.potentialPaths?.length) return null;

                            // Use a non-null assertion since we've checked for existence above
                            const pathProjections = job.careerPathProjections!;

                            return (
                                <div key={idx} className="p-4 rounded-lg border bg-card">
                                    <h3 className="text-lg font-semibold mb-2">{job.roleTitle}</h3>

                                    {/* Career progression visualization */}
                                    <div className="mt-4 mb-6">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                {1}
                                            </div>
                                            <div className="h-0.5 flex-1 bg-primary"></div>
                                            {pathProjections.potentialPaths.map((path, pathIdx) => (
                                                <Fragment key={pathIdx}>
                                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                        {pathIdx + 2}
                                                    </div>
                                                    {pathIdx < pathProjections.potentialPaths.length - 1 && (
                                                        <div className="h-0.5 flex-1 bg-primary"></div>
                                                    )}
                                                </Fragment>
                                            ))}
                                        </div>

                                        <div className="flex items-start mt-2 ml-4">
                                            <div className="min-w-[80px] text-sm font-medium">
                                                {job.roleTitle}
                                            </div>
                                            {pathProjections.potentialPaths.map((path, pathIdx) => (
                                                <div key={pathIdx} className="flex-1 text-sm font-medium text-center">
                                                    {path}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Required steps */}
                                    {pathProjections.requiredSteps && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold flex items-center gap-1 mb-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Required Steps
                                            </h4>
                                            <ul className="space-y-1 text-sm list-disc pl-5">
                                                {pathProjections.requiredSteps.map((step, stepIdx) => (
                                                    <li key={stepIdx}>{step}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Timeline estimate */}
                                    {pathProjections.timelineEstimate && (
                                        <div className="mt-4 text-sm font-medium flex items-center gap-1.5">
                                            <span className="text-muted-foreground">Estimated Timeline:</span>
                                            <span>{pathProjections.timelineEstimate}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Resume Improvement Visualization */}
            {data.resumeImprovement && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Resume Improvement Analysis</CardTitle>
                            <TooltipProvider>
                                <UITooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Recommendations to improve your resume's effectiveness</p>
                                    </TooltipContent>
                                </UITooltip>
                            </TooltipProvider>
                        </div>
                        <CardDescription>
                            Analysis and actionable steps to enhance your resume
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Overall assessment */}
                            {data.resumeImprovement.overallAssessment && (
                                <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                    <h3 className="text-base font-medium mb-2">Overall Assessment</h3>
                                    <p className="text-sm">{data.resumeImprovement.overallAssessment}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Missing Elements */}
                                {data.resumeImprovement.missingElements?.length > 0 && (
                                    <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
                                        <h3 className="text-sm font-semibold mb-2">Missing Elements</h3>
                                        <ul className="space-y-1 text-sm list-disc pl-5">
                                            {data.resumeImprovement.missingElements.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Content Weaknesses */}
                                {data.resumeImprovement.contentWeaknesses?.length > 0 && (
                                    <div className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                                        <h3 className="text-sm font-semibold mb-2">Content Weaknesses</h3>
                                        <ul className="space-y-1 text-sm list-disc pl-5">
                                            {data.resumeImprovement.contentWeaknesses.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Action Steps Section */}
                            {data.resumeImprovement.actionableSteps?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-base font-semibold mb-3">Action Steps</h3>
                                    <div className="space-y-3">
                                        {data.resumeImprovement.actionableSteps.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs flex-shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <div className="text-sm">{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resources Section */}
                            {data.resumeImprovement.professionalResourceLinks?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-base font-semibold mb-3">Professional Resources</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {data.resumeImprovement.professionalResourceLinks.map((resource, idx) => (
                                            <div key={idx} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                                                <h4 className="text-sm font-semibold">{resource.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                                                <div className="mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        External Resource
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Skill Development Time Chart */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Skill Development Requirements</CardTitle>
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Detailed skill development requirements for each role</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <CardDescription>
                        Training requirements for each recommended role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={data.jobRecommendations[0]?.roleTitle || ""} className="w-full">
                        <TabsList className="mb-4 w-full flex flex-wrap justify-start">
                            {data.jobRecommendations.map((job) => (
                                <TabsTrigger key={job.roleTitle} value={job.roleTitle} className="flex-shrink-0">
                                    {job.roleTitle}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {data.jobRecommendations.map((job) => (
                            <TabsContent key={job.roleTitle} value={job.roleTitle} className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">{job.roleTitle}</h3>
                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                        {job.skillDevelopment.reduce((acc, skill) => {
                                            const duration = skill.duration;
                                            const hourMatch = duration.match(/(\d+)h/);
                                            const hourValue = hourMatch ? parseInt(hourMatch[1]) : 0;

                                            const minuteMatch = duration.match(/(\d+)m/);
                                            const minuteValue = minuteMatch ? parseInt(minuteMatch[1]) / 60 : 0;

                                            return acc + hourValue + minuteValue;
                                        }, 0).toFixed(1)}h total
                                    </Badge>
                                </div>
                                <div className="space-y-4">
                                    {job.skillDevelopment.map((skill, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium">{skill.title || `Skill Development ${idx + 1}`}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{skill.description || "No description available"}</p>
                                                </div>
                                                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                                    {skill.duration}
                                                </Badge>
                                            </div>
                                            {skill.link && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <a
                                                        href={skill.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <TrendingUp className="h-3 w-3" />
                                                        Learn more
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {job.skillDevelopment.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No skill development information available for this role.
                                    </div>
                                )}
                            </TabsContent>
                        ))}

                    </Tabs>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                        Focus on developing these skills to qualify for each role
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}