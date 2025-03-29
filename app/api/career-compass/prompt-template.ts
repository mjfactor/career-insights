// Career compass prompt template
export const CAREER_COMPASS_PROMPT = `
**STRICT PROCESSING ORDER (DO NOT SKIP):**
1. COMPLETE Candidate Profile Analysis FIRST
2. ONLY THEN proceed to Job Recommendations
3. Confirm all profile analysis sections are complete before continuing.
---

# 1. Candidate Profile Analysis

## A. Core Competency Identification
- 🏅 **Technical Strengths**
- 📊 **Skill Frequency Analysis**:
  - Analyze the frequency of skills mentioned
  - Estimate the frequency of skill usage based on work experience descriptions (e.g., years of experience using each skill).
- 🧩 **Unique Value Proposition**:
  - Identify what makes the candidate distinct, such as rare skill combinations (e.g., Python and blockchain expertise),
    notable achievements (e.g., leading a successful project), or niche industry experience.
- 🎗️ **Certifications**:
  - List all the candidates certifications if they have any.

## B. Work Experience Summary (formerly Experience Archetype Mapping)
- ⏳ **Total Professional Tenure Breakdown**:
  - Summarize years of experience by role and industry.
- 🔀 **Multi-Industry Transfer Potential**:
  - Identify industries where the candidate's skills and experience are transferable (e.g., tech skills applicable to finance or healthcare).
  - Base recommendations on overlapping skills, certifications, or past projects.
- 📌 **Highlight: Most Impactful Project/Initiative**:
  - Describe the project, its impact, and relevance to career goals.

## C. Educational Pathway Analysis
- 🎓 **Degree Utilization Spectrum**:
  - Analyze possible applications of the candidate's degree to different careers.
  - Include relevant coursework or projects that align with potential career paths (e.g., a machine learning project for AI-related roles).
- 📜 **Certification Opportunities**:
  - Suggest certifications based on existing skills.
- 🌐 **Emerging Tech Alignment**:
  - Identify emerging technologies relevant to the candidate's field or interests (e.g., AI, blockchain, cybersecurity).
  - Assess alignment with their skills and education.

---
# 2. Job Recommendations
**DO NOT START BEFORE PROFILE ANALYSIS IS COMPLETE**
For each role (5-7 total, tailored to experience level):

## [Role Title] + Experience Level

| Assessment Metric     | Details |
|-----------------------|---------|
| 🔍 Skills Match       | [List of matching skills] |
| 👤 Experience Match   | [Experience alignment] |
| 📖 Education Match    | [Education relevance] |

### 💵 Salary Benchmarks
- Emphasize that salaries vary significantly by industry, location, and company size.
  Refer to [Glassdoor](https://glassdoor.com) and [PayScale](https://payscale.com) for accurate, up-to-date information.

### 🔗 Current Opportunities
- Provide 3-4 job search queries without specifying company names. Include recommended job boards or platforms (e.g., LinkedIn, Indeed, Glassdoor, JobStreet).
- Examples:
  - [Software Engineering](https://www.linkedin.com/jobs/search/?keywords=software%20engineer)
  - [Software Engineering](https://www.glassdoor.com/Job/software-engineer-jobs-SRCH_KO0,17.htm)
  - [Software Engineering](https://ph.indeed.com/jobs?q=software+engineer)

### 📚 Skill Development
- Provide 4 resources for skill development, including a mix of types (e.g., online courses, certifications, tutorials, books).
- *Format tables EXACTLY as shown below:*

| Tutorial Title       | Description                          | Duration | Link |
|----------------------|--------------------------------------|----------|------|
| [Course Name]        | [Specific skills covered]            | Xh Ym    | URL  |
| [Certification Name] | [Relevance to role]                  | Xh Ym    | URL  |

### 🌟 Career Path Projections
- Provide potential career paths or trajectories based on current skills and experience (e.g., 'With 5 years of Python experience,
  you could transition to a Senior Developer or Data Scientist role').
- Include steps to achieve these paths (e.g., certifications, additional experience).

### 🎲 Random Forest Insights
- Provide a brief, plausible explanation of how the pre-trained random forest model influenced the selection of this job role.
- Example: "The random forest prioritized your 5 years of Python experience and machine learning skills,
  identifying this role as a strong match due to high demand in AI-driven industries."
- Keep it concise (1-2 sentences) and tie it to the job's relevance.

---
## 3. Overall Random Forest Data Evaluation
**Important:** Do not start until job recommendations are complete.

### Overall Job Fit Score Per Role
- Report the final fit score (e.g., 73.5%) for each role.
- Example Format:
  "Software Engineer: 75.9%"
  "Data Analyst: 68.2%"
`;