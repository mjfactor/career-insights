import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, Laptop, HandshakeIcon, TableIcon } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'Job Market Trends in 2025 and beyond',
    message: 'Job Market Trends in 2025 and beyond',
    icon: <TrendingUp size={16} className="mr-2 text-green-500" />
  },
  {
    heading: 'What are the highest paying jobs in 2025?',
    message: 'What are the highest paying jobs in 2025?',
    icon: <DollarSign size={16} className="mr-2 text-green-500" />
  },
  {
    heading: 'Remote work vs in-office careers',
    message: 'Create a table comparing remote work and in-office careers showing pros and cons, salary differences, productivity impacts, and best industries for each as of 2025',
    icon: <Laptop size={16} className="mr-2 text-green-500" />
  },
  {
    heading: 'Tips for negotiating a higher salary',
    message: 'Tips for negotiating a higher salary',
    icon: <HandshakeIcon size={16} className="mr-2 text-green-500" />
  },
  {
    heading: 'Create a table comparing tech, finance, and healthcare careers',
    message: 'Create a comparison table of tech, finance, and healthcare careers showing average salary, growth outlook, entry requirements, and work-life balance',
    icon: <TableIcon size={16} className="mr-2 text-green-500" />
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
              <div className="flex items-center">
                {message.icon}

                {message.heading}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
