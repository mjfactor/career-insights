"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chart } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'

// This component will visualize career analysis data in charts
export function CareerDataVisualizer({ structuredData }: { structuredData: any }) {
    // Skip rendering if no data
    if (!structuredData) return null

    // Extract skill frequency data for skills chart
    const skillsChartData = useMemo(() => {
        if (!structuredData?.candidateProfile?.coreCompetencies?.skillFrequencyAnalysis) {
            return []
        }

        const skillsData = structuredData.candidateProfile.coreCompetencies.skillFrequencyAnalysis
        return Object.entries(skillsData).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : parseInt(value as string, 10) || 0
        }))
    }, [structuredData])

    // Extract job fit scores for job match chart
    const jobFitData = useMemo(() => {
        if (!structuredData?.overallEvaluation?.jobFitScores) {
            return []
        }

        const fitScores = structuredData.overallEvaluation.jobFitScores
        return Object.entries(fitScores).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : parseInt(value as string, 10) || 0
        }))
            .sort((a, b) => b.value - a.value) // Sort by highest score first
            .slice(0, 5) // Limit to top 5 jobs
    }, [structuredData])

    // Format job recommendations for radar chart
    const jobRecommendationData = useMemo(() => {
        if (!structuredData?.jobRecommendations || !structuredData.jobRecommendations.length) {
            return []
        }

        // Take top 5 job recommendations
        return structuredData.jobRecommendations
            .slice(0, 5)
            .map((job: any) => ({
                role: job.roleTitle,
                skillsMatch: job.assessment?.skillsMatch?.length || 0,
                experienceMatch: 80, // Using a placeholder value for visualization
                educationMatch: 65,  // Using a placeholder value for visualization
                salaryPotential: 75  // Using a placeholder value for visualization
            }))
    }, [structuredData])

    // Create industry transfer data
    const industryTransferData = useMemo(() => {
        if (!structuredData?.candidateProfile?.workExperience?.industryTransferPotential ||
            !structuredData.candidateProfile.workExperience.industryTransferPotential.length) {
            return []
        }

        // Create data for industry transfer pie chart
        return structuredData.candidateProfile.workExperience.industryTransferPotential
            .slice(0, 6) // Limit to 6 industries for better visualization
            .map((industry: string, index: number) => ({
                name: industry,
                value: 100 - (index * 10) // Assign decreasing values for pie chart visualization
            }))
    }, [structuredData])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills Analysis Chart */}
                <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Skills Analysis</CardTitle>
                        <CardDescription>Technical skill proficiency breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        {skillsChartData.length > 0 ? (
                            <Chart
                                className="p-4"
                                type="bar"
                                height={250}
                                data={skillsChartData}
                                xAxisKey="name"
                                series={[
                                    {
                                        key: "value",
                                        name: "Proficiency",
                                    }
                                ]}
                                accessibilityLayer={true}
                            />
                        ) : (
                            <div className="flex h-[250px] items-center justify-center p-4 text-sm text-muted-foreground">
                                No skills data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Job Match Score Chart */}
                <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Job Match Scores</CardTitle>
                        <CardDescription>Role suitability based on your profile</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        {jobFitData.length > 0 ? (
                            <Chart
                                className="p-4"
                                type="bar"
                                height={250}
                                data={jobFitData}
                                xAxisKey="name"
                                series={[
                                    {
                                        key: "value",
                                        name: "Match (%)",
                                        color: "var(--chart-2)"
                                    }
                                ]}
                                accessibilityLayer={true}
                            />
                        ) : (
                            <div className="flex h-[250px] items-center justify-center p-4 text-sm text-muted-foreground">
                                No job match data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry Transfer Potential Chart */}
                <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Industry Transfer Potential</CardTitle>
                        <CardDescription>Industries where your skills can be applied</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        {industryTransferData.length > 0 ? (
                            <Chart
                                className="p-4"
                                type="pie"
                                height={250}
                                data={industryTransferData}
                                xAxisKey="name"
                                series={[
                                    {
                                        key: "value",
                                        name: "Potential",
                                    }
                                ]}
                                accessibilityLayer={true}
                            />
                        ) : (
                            <div className="flex h-[250px] items-center justify-center p-4 text-sm text-muted-foreground">
                                No industry transfer data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recommended Roles Radar */}
                <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Role Compatibility Radar</CardTitle>
                        <CardDescription>Key factors for top recommended roles</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        {jobRecommendationData.length > 0 ? (
                            <Chart
                                className="p-4"
                                type="radar"
                                height={250}
                                data={[
                                    {
                                        role: "Skills Match",
                                        [jobRecommendationData[0].role]: jobRecommendationData[0].skillsMatch,
                                        [jobRecommendationData[1]?.role || "Role 2"]: jobRecommendationData[1]?.skillsMatch || 0,
                                        [jobRecommendationData[2]?.role || "Role 3"]: jobRecommendationData[2]?.skillsMatch || 0,
                                    },
                                    {
                                        role: "Experience Match",
                                        [jobRecommendationData[0].role]: jobRecommendationData[0].experienceMatch,
                                        [jobRecommendationData[1]?.role || "Role 2"]: jobRecommendationData[1]?.experienceMatch || 0,
                                        [jobRecommendationData[2]?.role || "Role 3"]: jobRecommendationData[2]?.experienceMatch || 0,
                                    },
                                    {
                                        role: "Education Match",
                                        [jobRecommendationData[0].role]: jobRecommendationData[0].educationMatch,
                                        [jobRecommendationData[1]?.role || "Role 2"]: jobRecommendationData[1]?.educationMatch || 0,
                                        [jobRecommendationData[2]?.role || "Role 3"]: jobRecommendationData[2]?.educationMatch || 0,
                                    },
                                    {
                                        role: "Salary Potential",
                                        [jobRecommendationData[0].role]: jobRecommendationData[0].salaryPotential,
                                        [jobRecommendationData[1]?.role || "Role 2"]: jobRecommendationData[1]?.salaryPotential || 0,
                                        [jobRecommendationData[2]?.role || "Role 3"]: jobRecommendationData[2]?.salaryPotential || 0,
                                    }
                                ]}
                                xAxisKey="role"
                                series={[
                                    {
                                        key: jobRecommendationData[0].role,
                                        name: jobRecommendationData[0].role,
                                        color: "var(--chart-1)"
                                    },
                                    jobRecommendationData[1] ? {
                                        key: jobRecommendationData[1].role,
                                        name: jobRecommendationData[1].role,
                                        color: "var(--chart-2)"
                                    } : null,
                                    jobRecommendationData[2] ? {
                                        key: jobRecommendationData[2].role,
                                        name: jobRecommendationData[2].role,
                                        color: "var(--chart-3)"
                                    } : null,
                                ].filter(Boolean) as any}
                                accessibilityLayer={true}
                            />
                        ) : (
                            <div className="flex h-[250px] items-center justify-center p-4 text-sm text-muted-foreground">
                                No job recommendation data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}