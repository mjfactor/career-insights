import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'Job Market Trends in 2025 and beyond',
    message: 'Job Market Trends in 2025 and beyond'
  },
  {
    heading: 'What are the highest paying jobs in 2025?',
    message: 'What are the highest paying jobs in 2025?'
  },
  {
    heading: 'Remote work vs in-office careers',
    message: 'Remote work vs in-office careers'
  },
  {
    heading: 'Tips for negotiating a higher salary',
    message: 'Tips for negotiating a higher salary'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
