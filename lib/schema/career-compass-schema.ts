import { z } from 'zod';

// Schema for the Career Compass structured data
export const CareerCompassSchema = z.object({
  candidateProfile: z.object({
    coreCompetencies: z.object({
      technicalSkills: z.array(z.string()).describe('List of key technical skills, tools, methodologies'),
      softSkills: z.array(z.string()).describe('List of soft skills like communication, leadership, teamwork'),
      mostUsedSkill: z.object({}).catchall(z.string()).describe('3-4 most frequently used skills'),
      uniqueValueProposition: z.string().describe('What makes the candidate distinct and valuable in the job market'),
      certifications: z.array(z.string()).describe('List of certifications if any, with dates if provided')
    }),
    workExperience: z.object({
      totalProfessionalTenure: z.string().describe('Summary of years by role/industry'),
      seniorityLevel: z.string().describe('Junior, mid-level, senior, executive, etc. based on experience'),
      industryTransferPotential: z.array(z.string()).describe('List of industries where skills transfer'),
      keyAccomplishments: z.array(z.string()).describe('List of major achievements from work history'),
      projectManagementExperience: z.string().describe('Description of project management experience if any'),
      teamSizeManaged: z.string().describe('Indication of team management experience if applicable'),
      mostImpactfulProject: z.object({
        title: z.string().describe('Project name'),
        description: z.string().describe('Brief description'),
        impact: z.string().describe('Measurable outcomes, metrics, ROI'),
        relevance: z.string().describe('To career goals'),
        technologies: z.array(z.string()).describe('Technologies used in this project')
      }),
      remoteWorkExperience: z.string().describe('Experience with remote/distributed teams if any'),
      internationalExperience: z.string().describe('Global/international work experience if any')
    }),
    education: z.object({
      highestDegree: z.string().describe('Highest level of education attained'),
      relevantCoursework: z.array(z.string()).describe('Courses relevant to career goals'),
      academicAchievements: z.array(z.string()).describe('Notable academic accomplishments'),
      degreeUtilization: z.array(z.string()).describe('Possible applications of degree to careers'),
      certificationOpportunities: z.array(z.string()).describe('Suggested certifications based on skills'),
      continuingEducation: z.array(z.string()).describe('Recent coursework or ongoing learning'),
      emergingTechAlignment: z.array(z.string()).describe('Emerging technologies relevant to candidate')
    }),
    careerProgression: z.object({
      growthTrajectory: z.string().describe('Analysis of career progression speed and direction'),
      promotionHistory: z.string().describe('Pattern of advancement in previous roles'),
      gapAnalysis: z.array(z.string()).describe('Skill or experience gaps for desired roles'),
      transitionReadiness: z.string().describe('Assessment of readiness for career change if applicable')
    })
  }),
  jobRecommendations: z.array(z.object({
    roleTitle: z.string().describe('Job title'),
    experienceLevel: z.string().describe('Entry/mid/senior'),
    industryFocus: z.string().describe('Primary industry for this role'),
    workplaceType: z.string().describe('Remote/hybrid/onsite preferences'),
    assessment: z.object({
      skillsMatch: z.array(z.string()).describe('Matching skills'),
      skillGaps: z.array(z.string()).describe('Skills needed for this role that candidate lacks'),
      experienceMatch: z.string().describe('Experience alignment description'),
      educationMatch: z.string().describe('Education relevance description'),
      cultureFit: z.string().describe('Alignment with typical culture for this role')
    }),
    salaryBenchmarks: z.object({
      range: z.string().describe('Salary range in Philippine Peso Monthly'),
      medianSalary: z.string().describe('Median salary figure'),
      factors: z.array(z.string()).describe('Industry, location, company size, experience level'),
      Source: z.string().describe('Link to source of salary data (PayScale, Glassdoor, etc.)')
    }),
    growthPotential: z.object({
      marketDemand: z.string().describe('Expected job growth rate'),
      upwardMobility: z.string().describe('Promotion potential')
    }),
    currentOpportunities: z.array(z.object({
      platform: z.string().describe('LinkedIn, Glassdoor, Indeed, etc.'),
      searchQuery: z.string().describe('Search query text'),
      url: z.string().url().describe('Direct URL to search')
    })).length(4).describe('Exactly 4 platforms with searchable links'),
    skillDevelopment: z.array(z.object({
      title: z.string().describe('Resource title'),
      description: z.string().describe('Resource description'),
      duration: z.string().describe('Estimated time to complete'),
      link: z.string().url().describe('URL to the resource')
    })).length(4).describe('4 skill development resources of different types'),
    careerPathProjections: z.object({
      potentialPaths: z.array(z.string()).describe('Possible career trajectories'),
      requiredSteps: z.array(z.string()).describe('Certifications, additional experience needed'),
      timelineEstimate: z.string().describe('Estimated time to achieve next level')
    }),
    randomForestInsights: z.string().describe('Explanation of how the model matched this role'),
    workLifeBalance: z.string().describe('Typical work-life balance for this role')
  })).min(5).max(7).describe('5-7 job recommendations'),
  overallEvaluation: z.object({
    jobFitScores: z.record(z.string(), z.number()).describe('Job titles with percentage fit scores'),
    marketPositioning: z.object({
      competitiveAdvantages: z.array(z.string()).describe('Candidate\'s strongest competitive advantages'),
      improvementAreas: z.array(z.string()).describe('Areas that would strengthen marketability')
    }),
    interviewReadiness: z.object({
      commonQuestions: z.array(z.string()).describe('Likely interview questions based on roles'),
      suggestedTalking_Points: z.array(z.string()).describe('Key experiences to highlight')
    }),
    personalBrandingSuggestions: z.array(z.string()).describe('Ways to strengthen professional presence')
  })
});

// Type definition generated from the Zod schema
export type CareerCompassData = z.infer<typeof CareerCompassSchema>;