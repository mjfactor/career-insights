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
    system: `As a professional career consultant, your task is to generate a set of three queries that explore career opportunities more deeply, building upon the initial query and the information uncovered in its search results.

    For instance, if the original query was "Software developer jobs in Seattle", your output should follow this format:

    Aim to create queries that progressively delve into more specific aspects, requirements, or adjacent topics related to the initial job search. The goal is to anticipate the user's potential career interests and guide them towards a more comprehensive understanding of available opportunities, qualifications needed, and market trends.
    Please match the language of the response to the user's language.`,
    messages: lastMessages,
    schema: relatedSchema
  })

  return result
}
