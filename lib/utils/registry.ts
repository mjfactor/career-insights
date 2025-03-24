import { google } from '@ai-sdk/google'
import {
  experimental_createProviderRegistry as createProviderRegistry,
  extractReasoningMiddleware,
  wrapLanguageModel
} from 'ai'

export const registry = createProviderRegistry({
  google
})

export function getModel(model: string) {
  const [provider, ...modelNameParts] = model.split(':') ?? []
  const modelName = modelNameParts.join(':')

  // Only Google models are supported
  if (provider !== 'google') {
    return registry.languageModel('google:gemini-2.0-flash')
  }

  return registry.languageModel(model)
}

export function isProviderEnabled(providerId: string): boolean {
  switch (providerId) {
    case 'google':
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    default:
      return false
  }
}

export function getToolCallModel(model?: string) {
  const [provider, ...modelNameParts] = model?.split(':') ?? []

  // Only return Google model regardless of input
  return getModel('google:gemini-2.0-flash')
}

export function isToolCallSupported(model?: string) {
  const [provider] = model?.split(':') ?? []

  // Google models don't support tool calls currently
  return false
}

export function isReasoningModel(model: string): boolean {
  if (typeof model !== 'string') {
    return false
  }

  // Only check Google models for reasoning capabilities
  const [provider] = model.split(':') ?? []
  if (provider !== 'google') {
    return false
  }

  // Google models that support reasoning
  return model.includes('thinking')
}
