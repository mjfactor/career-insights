"use client"

import { useState, useMemo } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { TrendingUp, Info } from "lucide-react"
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
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import React from "react"

// Define types for job recommendation structure
interface SkillDevelopment {
    title?: string;
    description?: string;
    duration: string;
    link?: string;
}

interface JobRecommendation {
    roleTitle: string;
    salaryBenchmarks?: {
        range?: string;
        description?: string;
    };
    skillDevelopment: SkillDevelopment[];
    assessment: {
        skillsMatch: string[];
        skillGaps?: string[];
    };
    growthPotential?: {
        marketDemand: string;
        upwardMobility: string;
    };
    randomForestInsights?: string;
    careerPathProjections?: {
        potentialPaths: string[];
        requiredSteps: string[];
        timelineEstimate: string;
    };
}

type ManualDataVisualizerProps = {
    jobRecommendations: JobRecommendation[];
}

// Custom colors for charts
const CHART_COLORS = {
    skills: "hsl(215, 90%, 60%)",
    jobFit: "hsl(170, 80%, 40%)",
    development: "hsl(340, 80%, 60%)"
}

export default function ManualDataVisualizer({ jobRecommendations }: ManualDataVisualizerProps) {
    // ==========================================================================
    // Ensure we have data to work with
    // ==========================================================================
    const hasData = useMemo(() => {
        return Array.isArray(jobRecommendations) && jobRecommendations.length > 0;
    }, [jobRecommendations]);

    // ==========================================================================
    // Extract Technical Skills from job recommendations
    // ==========================================================================
    const technicalSkills = useMemo(() => {
        if (!hasData) return [];

        // Extract all skills from job recommendations and remove duplicates
        return Array.from(new Set(
            jobRecommendations.flatMap(job =>
                job.assessment?.skillsMatch || []
            )
        ));
    }, [jobRecommendations, hasData]);

    // ==========================================================================
    // Job Fit Comparison Chart Data
    // ==========================================================================
    const jobFitData = useMemo(() => {
        if (!hasData) return [];

        return jobRecommendations
            .map((job, index) => {
                // Extract score from roleTitle if it contains percentage
                const scoreMatch = job.roleTitle.match(/\((\d+)%\)/);
                const score = scoreMatch ? parseInt(scoreMatch[1]) :
                    // Assign decreasing scores if none found
                    Math.max(90 - index * 10, 50);

                // Clean title if it contains score
                const cleanTitle = job.roleTitle.replace(/\s*\(\d+%\)/, '');

                return {
                    name: cleanTitle,
                    value: score
                };
            })
            .sort((a, b) => Number(b.value) - Number(a.value));
    }, [jobRecommendations, hasData]);

    const jobFitChartConfig = {
        value: {
            label: "Fit Score",
            color: CHART_COLORS.jobFit,
        },
    } satisfies ChartConfig;

    // ==========================================================================
    // Skills Match Table Data
    // ==========================================================================
    // Get unique skills across all job recommendations
    const uniqueSkills = useMemo(() => {
        if (!hasData) return [];

        const skillsSet = new Set<string>();

        jobRecommendations.forEach(job => {
            if (job.assessment && job.assessment.skillsMatch) {
                job.assessment.skillsMatch.forEach(skill => skillsSet.add(skill));
            }
        });

        return Array.from(skillsSet);
    }, [jobRecommendations, hasData]);

    // Create a mapping of job to skills
    const jobSkillsMap = useMemo(() => {
        if (!hasData) return {};

        const skillMap: Record<string, Set<string>> = {};

        jobRecommendations.forEach(job => {
            if (job.roleTitle) {
                skillMap[job.roleTitle] = new Set(job.assessment?.skillsMatch || []);
            }
        });

        return skillMap;
    }, [jobRecommendations, hasData]);

    // ==========================================================================
    // Skill Development Time Chart Data
    // ==========================================================================
    const skillDevelopmentData = useMemo(() => {
        if (!hasData) return [];

        return jobRecommendations
            .filter(job => job.skillDevelopment && Array.isArray(job.skillDevelopment))
            .map(job => {
                // Calculate total duration for each job role
                const totalHours = job.skillDevelopment.reduce((acc, skill) => {
                    if (!skill || !skill.duration) return acc;

                    const duration = skill.duration;
                    const hourMatch = duration.match(/(\d+)h/);
                    const hourValue = hourMatch ? parseInt(hourMatch[1]) : 0;

                    const minuteMatch = duration.match(/(\d+)m/);
                    const minuteValue = minuteMatch ? parseInt(minuteMatch[1]) / 60 : 0;

                    return acc + hourValue + minuteValue;
                }, 0);

                return {
                    name: job.roleTitle || "Unknown Role",
                    hours: Math.round(totalHours),
                };
            })
            .filter(item => !isNaN(item.hours) && item.hours > 0)
            .sort((a, b) => b.hours - a.hours);
    }, [jobRecommendations, hasData]);

    const developmentChartConfig = {
        hours: {
            label: "Training Hours",
            color: CHART_COLORS.development,
        },
    } satisfies ChartConfig;

    // If no data, show information message
    if (!hasData) {
        return (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Career Analysis</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Info className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground">No job recommendations data available</p>
                        <p className="text-xs text-muted-foreground mt-2">Please submit your details to see analysis</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Technical Skills Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle>Technical Skills</CardTitle>
                    <CardDescription>Skills matched to recommended job roles</CardDescription>
                </CardHeader>
                <CardContent>
                    {technicalSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {technicalSkills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="px-3 py-1 text-sm font-medium rounded-full shadow-sm"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No technical skills data available</p>
                    )}
                </CardContent>
            </Card>

           

            {/* Skills Match Analysis */}
            {uniqueSkills.length > 0 ? (
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
                                    {jobRecommendations.map((job, index) => (
                                        <TableRow
                                            key={job.roleTitle || `job-${index}`}
                                            className={cn(
                                                index % 2 === 0 ? "bg-background" : "bg-muted/20",
                                                "hover:bg-muted/40 transition-colors"
                                            )}
                                        >
                                            <TableCell className="font-medium">{job.roleTitle}</TableCell>
                                            {uniqueSkills.map(skill => (
                                                <TableCell
                                                    key={`${job.roleTitle || `job-${index}`}-${skill}`}
                                                    className="text-center"
                                                >
                                                    {jobSkillsMap[job.roleTitle]?.has(skill) ? (
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
                </Card>
            ) : (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Skills Match Analysis</CardTitle>
                        <CardDescription>Skill matching visualization</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-10">
                        <div className="text-center">
                            <Info className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-muted-foreground">No skills match data available</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* AI Insights Visualization */}
            {jobRecommendations.some(job => job.randomForestInsights) && (
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Career Insights</CardTitle>
                            <TooltipProvider>
                                <UITooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Career insights generated by our AI algorithm</p>
                                    </TooltipContent>
                                </UITooltip>
                            </TooltipProvider>
                        </div>
                        <CardDescription>
                            Key insights about your fit for different roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            {jobRecommendations.map((job, idx) => {
                                // Skip if no insights available
                                if (!job.randomForestInsights) return null;

                                // Extract key skills mentioned in the insights
                                const skills = technicalSkills.filter(skill =>
                                    job.randomForestInsights?.toLowerCase().includes(skill.toLowerCase())
                                );

                                // Highlight the text with key skills
                                let highlightedText = job.randomForestInsights || '';
                                skills.forEach(skill => {
                                    const regex = new RegExp(skill, 'gi');
                                    highlightedText = highlightedText.replace(
                                        regex,
                                        `<span class="font-medium text-primary">$&</span>`
                                    );
                                });

                                return (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-lg border bg-card transition-all"
                                    >
                                        <div className="mb-2">
                                            <h3 className="font-semibold text-lg">{job.roleTitle}</h3>
                                        </div>

                                        <div
                                            className="text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: highlightedText }}
                                        />

                                        {skills.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {skills.map(skill => (
                                                    <Badge key={skill} variant="outline">{skill}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        <p>Analysis based on your skills and experience with highlights on key matches</p>
                    </CardFooter>
                </Card>
            )}

            {/* Career Path Projections */}
            {jobRecommendations.some(job => job.careerPathProjections?.potentialPaths?.length) && (
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
                            {jobRecommendations.map((job, idx) => {
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
                                                    <React.Fragment key={pathIdx}>
                                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                            {pathIdx + 2}
                                                        </div>
                                                        {pathIdx < pathProjections.potentialPaths.length - 1 && (
                                                            <div className="h-0.5 flex-1 bg-primary"></div>
                                                        )}
                                                    </React.Fragment>
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
            )}

            {/* Skill Development Time Chart */}
            {jobRecommendations.some(job => job.skillDevelopment && job.skillDevelopment.length > 0) && (
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
                        <Tabs defaultValue={jobRecommendations[0]?.roleTitle || ""} className="w-full">
                            <TabsList className="mb-4 w-full flex flex-wrap justify-start">
                                {jobRecommendations.map((job) => (
                                    <TabsTrigger key={job.roleTitle} value={job.roleTitle} className="flex-shrink-0">
                                        {job.roleTitle}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {jobRecommendations.map((job) => (
                                <TabsContent key={job.roleTitle} value={job.roleTitle} className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold">{job.roleTitle}</h3>
                                        <Badge variant="outline" className="bg-primary/10 text-primary">
                                            {job.skillDevelopment?.reduce((acc, skill) => {
                                                if (!skill || !skill.duration) return acc;

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
                                        {job.skillDevelopment?.map((skill, idx) => (
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
                                    {!job.skillDevelopment?.length && (
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
            )}
        </div>
    )
} 