import { z } from "zod"
import { DeepPartial } from 'ai'

// Schema for skill frequency analysis
const skillFrequencyItemSchema = z.object({
    skill: z.string().describe("The name of the skill"),
    frequency: z.string().describe("The frequency/competency level as a percentage")
})

// Schema for candidate profile section
const candidateProfileSchema = z.object({
    coreCompetencies: z.object({
        technicalStrengths: z.array(z.string()).describe("List of the candidate's strongest technical skills"),
        skillFrequencyAnalysis: z.array(skillFrequencyItemSchema).describe("Analysis of skill frequency from the resume"),
        uniqueValueProposition: z.string().describe("The candidate's unique selling points/differentiators"),
        certifications: z.array(z.string()).optional().describe("Any certifications mentioned in the resume")
    }),
    workExperience: z.object({
        totalTenure: z.string().describe("Total professional experience duration"),
        transferPotential: z.array(z.string()).describe("Industries where skills could transfer well"),
        impactfulProject: z.object({
            name: z.string().describe("Name of the most impactful project from experience"),
            impact: z.string().describe("The measurable impact of this project"),
            relevance: z.string().describe("How this project is relevant to future roles")
        })
    }),
    education: z.object({
        degreeUtilization: z.string().describe("How well the candidate's education aligns with their career"),
        certificationOpportunities: z.array(
            z.object({
                name: z.string().describe("Name of recommended certification"),
                description: z.string().describe("Brief description of the certification and its value")
            })
        ).describe("Recommended certifications based on career goals"),
        emergingTechAlignment: z.array(z.string()).describe("Emerging technologies aligned with education")
    })
})

// Schema for job opportunity listings
const opportunitySchema = z.object({
    platform: z.string().describe("Job platform/site"),
    query: z.string().describe("Search query to use"),
    url: z.string().url().describe("URL to the job search")
})

// Schema for skill development recommendations
const skillDevelopmentSchema = z.object({
    title: z.string().describe("Name of the skill to develop"),
    description: z.string().describe("Description of why this skill is valuable"),
    duration: z.string().describe("Estimated time to gain competency"),
    link: z.string().url().describe("Resource link to learn this skill")
})

// Schema for job recommendation
const jobRecommendationSchema = z.object({
    roleTitle: z.string().describe("The recommended job role title"),
    experienceLevel: z.string().describe("Required experience level (Entry, Mid, Senior)"),
    assessment: z.object({
        skillsMatch: z.array(z.string()).describe("Skills from resume that match this role"),
        experienceMatch: z.string().describe("How well experience matches requirements"),
        educationMatch: z.string().describe("How education aligns with role requirements")
    }),
    salaryBenchmarks: z.string().describe("Typical salary range for this role"),
    currentOpportunities: z.array(opportunitySchema).describe("Job platforms to search for this role"),
    skillDevelopment: z.array(skillDevelopmentSchema).describe("Skills to develop for this role"),
    careerPathProjections: z.array(z.string()).describe("Potential career progression paths"),
    randomForestInsights: z.string().describe("Insights from the AI model about role fit")
})

// Schema for job fit scores
const jobFitScoreSchema = z.object({
    role: z.string().describe("Job role title"),
    score: z.string().describe("Match score percentage")
})

// Schema for overall evaluation
const overallEvaluationSchema = z.object({
    jobFitScores: z.array(jobFitScoreSchema).describe("Match scores for each job role")
})

// Main career compass analysis schema
export const careerCompassSchema = z.object({
    candidateProfile: candidateProfileSchema.describe("Profile analysis based on resume"),
    jobRecommendations: z.array(jobRecommendationSchema).describe("Recommended job roles with details"),
    overallEvaluation: overallEvaluationSchema.describe("Overall evaluation and scores")
})

export type CareerCompassAnalysis = z.infer<typeof careerCompassSchema>
export type PartialCareerCompassAnalysis = DeepPartial<CareerCompassAnalysis>