import { generateRelatedQuestions } from '@/lib/agents/generate-related-questions'
import { ExtendedCoreMessage } from '@/lib/types'
import { convertToExtendedCoreMessages } from '@/lib/utils/index'
import { CoreMessage, DataStreamWriter, JSONValue, Message } from 'ai'

interface HandleStreamFinishParams {
  responseMessages: CoreMessage[]
  originalMessages: Message[]
  model: string

  dataStream: DataStreamWriter
  skipRelatedQuestions?: boolean
  annotations?: ExtendedCoreMessage[]
}

export async function handleStreamFinish({
  responseMessages,
  originalMessages,
  model,
 
  dataStream,
  skipRelatedQuestions = false,
  annotations = []
}: HandleStreamFinishParams) {
  try {
    const extendedCoreMessages = convertToExtendedCoreMessages(originalMessages)
    let allAnnotations = [...annotations]

    if (!skipRelatedQuestions) {
      // Notify related questions loading
      const relatedQuestionsAnnotation: JSONValue = {
        type: 'related-questions',
        data: { items: [] }
      }
      dataStream.writeMessageAnnotation(relatedQuestionsAnnotation)

      // Generate related questions
      const relatedQuestions = await generateRelatedQuestions(
        responseMessages,
        model
      )

      // Create and add related questions annotation
      const updatedRelatedQuestionsAnnotation: ExtendedCoreMessage = {
        role: 'data',
        content: {
          type: 'related-questions',
          data: relatedQuestions.object
        } as JSONValue
      }

      dataStream.writeMessageAnnotation(
        updatedRelatedQuestionsAnnotation.content as JSONValue
      )
      allAnnotations.push(updatedRelatedQuestionsAnnotation)
    }

    // Create the message to save
    





    // Save chat with complete response and related questions
  } catch (error) {
    console.error('Error in handleStreamFinish:', error)
    throw error
  }
}
