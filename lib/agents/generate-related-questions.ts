import { relatedSchema } from '@/lib/schema/related'
import { CoreMessage, generateObject } from 'ai'
import {
  getModel,
  getToolCallModel,
  isToolCallSupported
} from '../utils/registry'

export async function generateRelatedQuestions(
  messages: CoreMessage[],
  model: string
) {
  const lastMessages = messages.slice(-1).map(message => ({
    ...message,
    role: 'user'
  })) as CoreMessage[]

  const supportedModel = isToolCallSupported(model)
  const currentModel = supportedModel
    ? getModel(model)
    : getToolCallModel(model)

  const result = await generateObject({
    model: currentModel,
    system: `As a professional career consultant, your task is to generate a set of three career-focused follow-up queries that explore job and professional development opportunities more deeply. You must ONLY generate questions related to careers, jobs, and professional development.

    Rules:
    1. Every query MUST be directly related to:
       - Job searching and opportunities
       - Career development and paths
       - Professional skills and qualifications
       - Industry-specific requirements
       - Workplace topics
       - Professional development
    
    2. Immediately reject and do not generate questions for any topics unrelated to careers or professional development.

    3. Format Example:
       If the original query was "Software developer jobs in Seattle", generate progressive questions like:
       - "What specific technical skills are most in-demand for Seattle software developers?"
       - "Which Seattle tech companies offer the best career growth opportunities?"
       - "What salary ranges can senior software developers expect in Seattle's market?"

    Focus on creating queries that:
    - Explore deeper aspects of the career path
    - Investigate professional requirements
    - Examine market conditions and trends
    - Address career growth opportunities
    
    Match the language style of the original query while maintaining a professional focus.`,
    messages: lastMessages,
    schema: relatedSchema
  })

  return result
}