'use client'

import React, { useEffect } from 'react'
import { Info } from 'lucide-react'
import { Message, useChat } from 'ai/react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'
import { HISTORY_UPDATE_EVENT } from '@/components/sidebar/chat-history'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Chat({
  id,
  savedMessages = [],
  query,
  userId = 'anonymous'
}: {
  id: string
  savedMessages?: Message[]
  query?: string

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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-3 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Career Advisor Chat</h2>

              <p className="text-muted-foreground max-w-md mx-auto mb-4 text-center">
                Your AI-powered career guidance assistant. Get expert advice on job trends, salary negotiations, interview techniques,
                and personalized career advancement strategies.
              </p>

              <div className="flex justify-center gap-2 mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground border px-2 py-1 rounded-full cursor-help">
                        <Info className="h-3 w-3 text-primary" />
                        <span>About this assistant</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] p-3">
                      <p className="text-xs">
                        This AI assistant combines real-time web access with knowledge about career development, job markets,
                        and professional growth strategies to provide personalized guidance for your career journey.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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

          />
        )}
      </div>
    </div>
  )
}
