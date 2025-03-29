'use client'

import React, { useEffect } from 'react'

import { Model } from '@/lib/types/models'
import { Message, useChat } from 'ai/react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'
import { HISTORY_UPDATE_EVENT } from '@/components/sidebar/chat-history'

export function Chat({
  id,
  savedMessages = [],
  query,
  models,
  userId = 'anonymous'
}: {
  id: string
  savedMessages?: Message[]
  query?: string
  models?: Model[]
  userId?: string
}) {

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    stop,
    append,
    data,
    setData
  } = useChat({
    initialMessages: savedMessages,
    id,
    body: {
      id,
      userId
    },
    onFinish: () => {
      // Update URL without page refresh
      window.history.replaceState({}, '', `/dashboard/chat/${id}`)

      // Dispatch event to update chat history
      window.dispatchEvent(new Event(HISTORY_UPDATE_EVENT))
    },
    experimental_throttle: 50, // Throttle updates to improve rendering performance
    onError: error => {
      toast.error(`Error in chat: ${error.message}`)
    }
  })

  useEffect(() => {
    setMessages(savedMessages)
  }, [id])

  const onQuerySelect = (query: string) => {
    append({
      role: 'user',
      content: query
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(undefined) // reset data to clear tool call
    handleSubmit(e)
  }


  return (
    <div className="flex flex-col items-center w-full h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="w-full max-w-3xl flex-1 flex flex-col px-4 ">
        {messages.length > 0 ? (
          <div className="flex-1 pt-10 pb-10">
            <ChatMessages
              messages={messages}
              data={data}
              onQuerySelect={onQuerySelect}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col">
            {/* Career advisor header - only shown when no messages exist */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-1">Career Advisor Chat Agent</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-1">
                Your personal career guidance assistant chatbot agent that can search the web. Ask anything about job trends,
                salary negotiations, interview tips, or career advancement opportunities.
              </p>
            </div>

            <ChatPanel
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              messages={messages}
              setMessages={setMessages}
              stop={stop}
              query={query}
              append={append}
              models={models}
            />
          </div>
        )}

        {messages.length > 0 && (
          <ChatPanel
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            messages={messages}
            setMessages={setMessages}
            stop={stop}
            query={query}
            append={append}
            models={models}
          />
        )}
      </div>
    </div>
  )
}
