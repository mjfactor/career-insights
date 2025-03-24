'use client'

import React, { useEffect } from 'react'

import { Model } from '@/lib/types/models'
import { Message, useChat } from 'ai/react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'

export function Chat({
  savedMessages = [],
  query,
  models
}: {
  savedMessages?: Message[]
  query?: string
  models?: Model[]
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
    experimental_throttle: 50, // Throttle updates to improve rendering performance
    onError: error => {
      toast.error(`Error in chat: ${error.message}`)
    }
  })



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
      <div className="w-full max-w-3xl flex-1 flex flex-col px-4">
        {messages.length > 0 ? (
          <div className="flex-1 pt-14 pb-4">
            <ChatMessages
              messages={messages}
              data={data}
              onQuerySelect={onQuerySelect}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
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
