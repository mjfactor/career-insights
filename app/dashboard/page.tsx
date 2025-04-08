import { redirect } from "next/navigation"
import AuthSidebarWrapper from "@/components/sidebar/auth-sidebar-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { ModeToggle } from "@/components/dark-light-toggle/theme-toggle"
import { Metadata } from "next"
import VideoDemo from "@/components/dashboard/VideoDemo"
import { ChevronRight, Rocket, BarChart3, Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your career insights dashboard",
}

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/")
  }

  // Video sources for demo - replace these with your actual video files
  const videoSources = {
    careerCompass: "/videos/career-compass-demo.mp4",
    aggregator: "/videos/aggregator-demo.mp4",
    chatbot: "/videos/chatbot-demo.mp4"
  }

  return (
    <SidebarProvider>
      <AuthSidebarWrapper />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-card">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Employment Opportunities</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {/* Hero section with gradient background */}
          <div className="bg-card text-card-foreground">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-12 md:py-16 lg:py-20">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Welcome
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mb-6 text-white/90">
                  Explore our AI-powered tools designed to optimize your job search and career growth journey
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {[
                    {
                      icon: <BarChart3 className="h-6 w-6" />,
                      title: "Data-Driven Insights",
                      description: "Get personalized career analytics based on market trends"
                    },
                    {
                      icon: <Rocket className="h-6 w-6" />,
                      title: "Accelerated Job Search",
                      description: "Find the most relevant opportunities from across the web"
                    },
                    {
                      icon: <Trophy className="h-6 w-6" />,
                      title: "Skills Optimization",
                      description: "Identify and develop the skills that matter most"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                      <div className="shrink-0 h-12 w-12 bg-white/20 flex items-center justify-center rounded-full">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-white/80">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Video Demo Section with glass morphism cards */}
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Feature Demonstrations</h2>
              <p className="text-muted-foreground">Watch how our tools can help advance your career opportunities</p>
            </div>

            <VideoDemo videoSources={videoSources} />

            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-6">Ready to take your career to the next level?</h2>
              <a
                href="/dashboard/career-compass"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Get Started with Career Compass
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer with subtle pattern */}
          <div className="border-t bg-muted/30">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-muted-foreground text-sm">
                2025 Employment Opportunities Platform. All rights reserved.
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
