'use client'

import { cn } from '@/lib/utils'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'

interface MessageActionsProps {
  message: string
  enableShare?: boolean
  className?: string
}

export function MessageActions({
  message,
  className
}: MessageActionsProps) {
  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied to clipboard')
  }

  return (
    <div className={cn('flex items-center gap-0.5 self-end', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="rounded-full"
      >
        <Copy size={14} />
      </Button>
    </div>
  )
}
