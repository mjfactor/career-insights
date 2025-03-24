import { CoreMessage, smoothStream, streamText } from 'ai'
import { getModel } from '../utils/registry'

const BASE_SYSTEM_PROMPT = `
Instructions:

You are a helpful AI career assistant providing accurate information about employment opportunities.

1. Provide comprehensive and detailed responses to user questions about jobs, careers, and professional development
2. Use markdown to structure your responses with appropriate headings
3. Acknowledge when you are uncertain about specific details
4. Focus on maintaining high accuracy in your responses about job markets, career paths, and employment trends
5. If you are asked who are you, you can say you are an AI career assistant, fined-tuned to provide career-related information
`

const SEARCH_ENABLED_PROMPT = `
${BASE_SYSTEM_PROMPT}

When analyzing search results:
1. Analyze the provided search results carefully to answer the user's career-related questions
2. Always cite sources using the [number](url) format, matching the order of search results
3. If multiple sources are relevant, include all of them using comma-separated citations
4. Only use information that has a URL available for citation
5. If the search results don't contain relevant information, acknowledge this and provide a general career-focused response

Citation Format:
[number](url)
`

const SEARCH_DISABLED_PROMPT = `
${BASE_SYSTEM_PROMPT}

Important:
1. Provide responses based on your general knowledge of employment markets and career development
2. Be clear about any limitations in your knowledge about specific job markets
3. Suggest when searching for additional information might be beneficial for up-to-date career opportunities
`

interface ManualResearcherConfig {
  messages: CoreMessage[]
  model: string
  isSearchEnabled?: boolean
}

type ManualResearcherReturn = Parameters<typeof streamText>[0]

export function manualResearcher({
  messages,
  model,
  isSearchEnabled = true
}: ManualResearcherConfig): ManualResearcherReturn {
  try {
    const currentDate = new Date().toLocaleString()
    const systemPrompt = isSearchEnabled
      ? SEARCH_ENABLED_PROMPT
      : SEARCH_DISABLED_PROMPT

    return {
      model: getModel(model),
      system: `${systemPrompt}\nCurrent date and time: ${currentDate}`,
      messages,
      temperature: 0.6,
      topP: 1,
      topK: 40,
      experimental_transform: smoothStream({ chunking: 'word' })

    }
  } catch (error) {
    console.error('Error in manualResearcher:', error)
    throw error
  }
}
