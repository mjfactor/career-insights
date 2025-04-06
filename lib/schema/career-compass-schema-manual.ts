import { z } from 'zod';

const LinkSchema = z.object({
  platform: z.string().describe("Name of the platform (e.g., LinkedIn, Glassdoor, Payscale)"),
  searchQuery: z.string().describe("The search query text used or suggested"),
  url: z.string().describe("Direct URL to the search results or resource")
});

const ProfessionalResourceLinkSchema = z.object({
  title: z.string().describe("Title of the resource"),
  description: z.string().describe("Brief description of how this resource helps"),
  link: z.string().describe("URL to the helpful resource")
});

const SkillDevelopmentResourceSchema = z.object({
  title: z.string().describe("Title of the course, certification, tutorial, or book"),
  description: z.string().describe("Brief description of the resource content"),
  duration: z.string().describe("Estimated time commitment (e.g., '6h 30m', '80h 0m', '20h 0m')"),
  link: z.string().describe("URL to access the resource")
});


// --- Main Candidate Analysis Schema (Represents the full structure) ---
export const CandidateAnalysisManualSchema = z.object({
  jobRecommendations: z.array(
    z.object({
      roleTitle: z.string().describe("Recommended job title"),
      experienceLevel: z.string().describe("Target experience level"), // Consider z.enum
      industryFocus: z.string().describe("Primary industry for the role"),
      workplaceType: z.string().describe("Typical workplace setting"), // Consider z.enum
      assessment: z.object({
        skillsMatch: z.array(z.string()).describe("Candidate skills matching the role"),
        skillGaps: z.array(z.string()).describe("Required skills the candidate may lack"),
        experienceMatch: z.string().describe("Alignment of work experience"),
        educationMatch: z.string().describe("Relevance of education"),
        cultureFit: z.string().describe("Potential alignment with typical role/industry culture")
      }).describe("Candidate fit assessment for the role"),
      salaryBenchmarks: z.object({
        description: z.string().default("For more accurate salary estimates, consider using the following resources:"),
        links: z.array(LinkSchema).describe("Links to salary comparison sites")
      }).describe("Salary research resources"),
      growthPotential: z.object({
        marketDemand: z.string().describe("Expected job growth rate/demand"),
        upwardMobility: z.string().describe("Potential for promotion")
      }).describe("Career growth outlook"),
      currentOpportunities: z.array(LinkSchema)
        .length(4, "Must provide links for exactly 4 job platforms")
        .describe("Links to job postings on 4 platforms"),
      skillDevelopment: z.array(SkillDevelopmentResourceSchema)
        .length(4, "Must provide exactly 4 diverse skill development resources")
        .describe("4 curated resources for skill enhancement"),
      careerPathProjections: z.object({
        potentialPaths: z.array(z.string()).describe("Possible future career trajectories"),
        requiredSteps: z.array(z.string()).describe("Steps needed for advancement"),
        timelineEstimate: z.string().describe("Estimated time to reach next level")
      }).describe("Future career path projections"),
      randomForestInsights: z.string().describe("Come up with an explanation of how the model arrived at this recommendation"),
      workLifeBalance: z.string().describe("Typical work-life balance for the role")
    }).describe("Detailed job recommendation")
  ).min(3).max(7).describe("List of 3 to 7 detailed job recommendations"),
}).describe("Comprehensive analysis job recommendations");