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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Fragment } from "react"; // Import Fragment from react

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
    randomForestInsights?: string;
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
    };
    overallEvaluation: {
        jobFitScores: Record<string, string | number> | Array<{ jobTitle: string; score: string | number }>;
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
    // Certifications
    // ==========================================================================
    const certifications = useMemo(() => {
        // Check both possible locations for certifications data
        return data.candidateProfile.education?.certifications ||
            data.candidateProfile.coreCompetencies?.certifications || []
    }, [data])

    // ==========================================================================
    // Job Fit Comparison Chart Data
    // ==========================================================================
    const jobFitData = useMemo(() => {
        // Check if jobFitScores is an array (new format) or object (old format)
        if (Array.isArray(data.overallEvaluation.jobFitScores)) {
            return data.overallEvaluation.jobFitScores
                .map(item => ({
                    name: item.jobTitle,
                    value: typeof item.score === 'string' && item.score.endsWith('%')
                        ? parseInt(item.score.replace('%', ''))
                        : typeof item.score === 'number'
                            ? Math.round(item.score * 100) // Convert decimal scores (0.85) to percentage
                            : parseInt(String(item.score))
                }))
                .sort((a, b) => Number(b.value) - Number(a.value));
        } else {
            // Handle old format (Record<string, string | number>)
            return Object.entries(data.overallEvaluation.jobFitScores)
                .map(([name, value]) => {
                    // Handle percentage strings with % sign
                    if (typeof value === 'string' && value.endsWith('%')) {
                        return { name, value: parseInt(value.replace('%', '')) };
                    }
                    // Handle decimal scores (e.g., 0.85)
                    if (typeof value === 'number' && value < 1) {
                        return { name, value: Math.round(value * 100) };
                    }
                    return { name, value };
                })
                .sort((a, b) => Number(b.value) - Number(a.value));
        }
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
            )}

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

            {/* Skills Radar Chart */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Skills Distribution</CardTitle>
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Distribution of your skills across different categories</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <CardDescription>
                        Visualizing your technical and soft skills coverage
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    {useMemo(() => {
                        // Create data for the radar chart by categorizing skills
                        const allCourses: Array<{
                            title: string;
                            duration: string;
                            jobRole: string;
                            category: string;
                            hours: number;
                        }> = [];

                        // Dynamically determine categories from skill data
                        // Extract technical skills from candidate profile for keywords
                        const techSkills = data.candidateProfile?.coreCompetencies?.technicalSkills || [];
                        const softSkills = data.candidateProfile?.coreCompetencies?.softSkills || [];

                        // Define common categories but use skills from the actual data for keywords
                        const categories = [
                            {
                                name: "Programming",
                                keywords: techSkills
                                    .filter(skill =>
                                        ["java", "python", "javascript", "typescript", "c#", "c++", "coding", "html", "css"].some(
                                            prog => skill.toLowerCase().includes(prog)
                                        )
                                    )
                                    .concat(["coding", "programming", "development", "react", "angular", "vue"])
                            },
                            {
                                name: "Data Science",
                                keywords: techSkills
                                    .filter(skill =>
                                        ["data", "sql", "analytics", "statistics", "tableau", "power bi"].some(
                                            data => skill.toLowerCase().includes(data)
                                        )
                                    )
                                    .concat(["data", "analytics", "statistics", "visualization"])
                            },
                            {
                                name: "Cloud & DevOps",
                                keywords: techSkills
                                    .filter(skill =>
                                        ["aws", "azure", "gcp", "devops", "cloud", "docker", "kubernetes"].some(
                                            cloud => skill.toLowerCase().includes(cloud)
                                        )
                                    )
                                    .concat(["cloud", "devops", "infrastructure", "deployment"])
                            },
                            {
                                name: "AI & ML",
                                keywords: techSkills
                                    .filter(skill =>
                                        ["ai", "ml", "machine", "learning", "deep", "nlp", "artificial"].some(
                                            ai => skill.toLowerCase().includes(ai)
                                        )
                                    )
                                    .concat(["machine learning", "deep learning", "artificial intelligence", "nlp"])
                            },
                            {
                                name: "Design",
                                keywords: techSkills
                                    .filter(skill =>
                                        ["design", "ui", "ux", "figma", "sketch", "photoshop"].some(
                                            design => skill.toLowerCase().includes(design)
                                        )
                                    )
                                    .concat(["design", "ui", "ux", "user experience", "user interface"])
                            },
                            {
                                name: "Project Management",
                                keywords: softSkills
                                    .filter(skill =>
                                        ["project", "management", "agile", "scrum", "leadership", "jira"].some(
                                            mgmt => skill.toLowerCase().includes(mgmt)
                                        )
                                    )
                                    .concat(["project management", "agile", "scrum", "leadership"])
                            },
                        ];

                        // Extract courses from all job recommendations
                        data.jobRecommendations.forEach(job => {
                            if (!job.skillDevelopment?.length) return;

                            job.skillDevelopment.forEach(course => {
                                // Extract hours from duration (e.g., "10h 30m" → 10.5)
                                const durationMatch = course.duration.match(/(\d+)h(?:\s+(\d+)m)?/);
                                const hours = durationMatch ?
                                    parseInt(durationMatch[1]) + (durationMatch[2] ? parseInt(durationMatch[2]) / 60 : 0) :
                                    0;

                                // Determine category based on course title and description
                                let category = "Other";
                                for (const cat of categories) {
                                    const titleAndDesc = (course.title + " " + (course.description || "")).toLowerCase();
                                    if (cat.keywords.some(keyword => titleAndDesc.includes(keyword))) {
                                        category = cat.name;
                                        break;
                                    }
                                }

                                allCourses.push({
                                    title: course.title!,
                                    duration: course.duration,
                                    jobRole: job.roleTitle,
                                    category,
                                    hours
                                });
                            });
                        });

                        // Create pie chart data by category
                        const pieData = Object.entries(
                            allCourses.reduce((acc, course) => {
                                acc[course.category] = (acc[course.category] || 0) + course.hours;
                                return acc;
                            }, {} as Record<string, number>)
                        ).map(([name, hours]) => ({ name, hours }));

                        // Calculate total hours
                        const totalHours = pieData.reduce((sum, item) => sum + item.hours, 0);

                        // Colors for categories - dynamically generate with fallback colors
                        const defaultColors = [
                            "#3b82f6", // blue
                            "#8b5cf6", // purple
                            "#06b6d4", // cyan
                            "#f43f5e", // rose
                            "#f97316", // orange
                            "#10b981", // emerald
                            "#6b7280"  // gray
                        ];

                        // Get unique categories from courses
                        const uniqueCategories = [...new Set(allCourses.map(course => course.category))];

                        // Generate colors for each category
                        const categoryColors: Record<string, string> = uniqueCategories.reduce((colors, category, index) => {
                            colors[category] = defaultColors[index % defaultColors.length];
                            return colors;
                        }, { "Other": "#6b7280" } as Record<string, string>);

                        // Define radar chart config
                        const radarChartConfig = Object.entries(categoryColors).reduce((config, [category, color]) => {
                            config[category] = {
                                theme: {
                                    light: color,
                                    dark: color
                                }
                            };
                            return config;
                        }, {} as Record<string, any>);

                        return (
                            <ChartContainer config={radarChartConfig}>
                                <RadarChart outerRadius={150} width={730} height={350} data={pieData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Skills Coverage"
                                        dataKey="hours"
                                        stroke={CHART_COLORS.skills}
                                        fill={CHART_COLORS.skills}
                                        fillOpacity={0.5}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </RadarChart>
                            </ChartContainer>
                        );
                    }, [data, technicalSkills])}
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                        Strongest category: Programming Languages
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Higher coverage indicates more skills in that category
                    </div>
                </CardFooter>
            </Card>

            {/* AI Insights Visualization */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Random Forest Career Insights</CardTitle>
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Career insights generated by our Random Forest AI algorithm</p>
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
                        {data.jobRecommendations.map((job, idx) => {
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
                    <p>Analysis based on your skills and experience data with highlights on key matches</p>
                </CardFooter>
            </Card>

            {/* Career Path Projections Visualization */}
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