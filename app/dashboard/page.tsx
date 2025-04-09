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
import { ChevronRight } from "lucide-react"

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


          {/* Video Demo Section with glass morphism cards */}
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Hi!</h2>
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
