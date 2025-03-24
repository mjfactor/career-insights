'use client'

import { Text } from 'lucide-react'
import { CollapsibleMessage } from './collapsible-message'
import { DefaultSkeleton } from './default-skeleton'
import { ReadableBotMessage } from './readable-bot-message'

export type AnswerSectionProps = {
  content: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void

}

export function AnswerSection({
  content,
  isOpen,
  onOpenChange,
}: AnswerSectionProps) {
  const header = (
    <div className="flex items-center gap-1">
      <Text size={16} />
      <div>Answer</div>
    </div>
  )
  const message = content ? (
    <div className="flex flex-col gap-4">
      <ReadableBotMessage message={content} />
    </div>
  ) : (
    <DefaultSkeleton />
  )
  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={false}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showBorder={false}
    >
      {message}
    </CollapsibleMessage>
  )
}
