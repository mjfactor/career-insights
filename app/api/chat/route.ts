import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { Model } from '@/lib/types/models'
import { cookies } from 'next/headers'

export const maxDuration = 30

const GEMINI_MODEL: Model = {
  id: 'gemini-2.0-flash',
  name: 'Gemini 2.0 Flash',
  provider: 'Google Generative AI',
  providerId: 'google',
  enabled: true,
  toolCallType: 'manual'
}

export async function POST(req: Request) {
  try {
    const { messages, id: chatId, userId = 'anonymous' } = await req.json()
    const cookieStore = await cookies()
    const searchMode = cookieStore.get('search-mode')?.value === 'true'

    // Always use the Gemini model
    const selectedModel = GEMINI_MODEL

    // All Gemini models use manual tool calling
    return createManualToolStreamResponse({
      messages,
      model: selectedModel,
      chatId,
      searchMode,
      userId
    })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
