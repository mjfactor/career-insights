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
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    };
    workLifeBalance?: string;
}

interface CareerData {
    candidateProfile: {
        coreCompetencies: {
            skillFrequencyAnalysis?: Record<string, number>;
            technicalSkills?: string[];
            technicalStrengths?: string[];
            softSkills?: string[];
            mostUsedSkill?: string[];
        };
    };
    overallEvaluation: {
        jobFitScores: Record<string, string | number>;
        marketPositioning?: {
            competitiveAdvantages: string[];
            improvementAreas: string[];
        };
    };
    jobRecommendations: JobRecommendation[];
}

type CareerDataVisualizerProps = {
    structuredData?: CareerData;
}

// Custom colors for charts
const CHART_COLORS = {
    skills: "hsl(215, 90%, 60%)",
    jobFit: "hsl(170, 80%, 40%)",
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
    // Job Fit Comparison Chart Data
    // ==========================================================================
    const jobFitData = useMemo(() => {
        return Object.entries(data.overallEvaluation.jobFitScores)
            .map(([name, value]) => {
                // Handle percentage strings with % sign
                if (typeof value === 'string' && value.endsWith('%')) {
                    return { name, value: parseInt(value.replace('%', '')) };
                }
                return { name, value };
            })
            .sort((a, b) => Number(b.value) - Number(a.value));
    }, [data])

    const jobFitChartConfig = {
        value: {
            label: "Fit Score",
            color: CHART_COLORS.jobFit,
        },
    } satisfies ChartConfig

    // ==========================================================================
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

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Skills Card */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Technical Skills</CardTitle>
                        <CardDescription>All identified technical skills</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                {/* Soft Skills Card */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Soft Skills</CardTitle>
                        <CardDescription>All identified soft skills</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {softSkills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="px-3 py-1 text-sm font-medium rounded-full shadow-sm"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Job Fit Comparison Chart */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Job Fit Analysis</CardTitle>
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Jobs are scored based on how well your skills and experience match the role requirements</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <CardDescription>
                        Job compatibility based on skills, experience, and education
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ChartContainer config={jobFitChartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={jobFitData}
                            margin={{
                                top: 40,
                                right: 40,
                                bottom: 200,
                                left: 40,
                            }}
                            barCategoryGap={20}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="value"
                                fill={CHART_COLORS.jobFit}
                                radius={6}
                                maxBarSize={50}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value: number) => `${value}%`}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                        <TrendingUp className="h-4 w-4" /> Top match: {jobFitData[0]?.name || "Software Engineer"}
                    </div>
                </CardFooter>
            </Card>

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
            </Card>

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
                                    <p className="max-w-xs">Estimated hours needed to develop missing skills for each role</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <CardDescription>
                        Training time investment needed per role
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ChartContainer config={developmentChartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={skillDevelopmentData}
                            margin={{
                                top: 40,
                                right: 40,
                                bottom: 200,
                                left: 40,
                            }}
                            barCategoryGap={20}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                                formatter={(value) => [`${value}h`, "Hours"]}
                            />
                            <Bar
                                dataKey="hours"
                                fill={CHART_COLORS.development}
                                radius={6}
                                maxBarSize={50}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value: number) => `${value}h`}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                        Quickest path: {skillDevelopmentData[skillDevelopmentData.length - 1]?.name || "Software Engineer"}
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Lower hours indicate less training needed to qualify for the role
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}