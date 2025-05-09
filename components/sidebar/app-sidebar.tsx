"use client"

import type * as React from "react"
import {
  Compass,
  LayoutDashboard,
  FileText,
  Trash2,
  BotMessageSquareIcon,
  Clock,
  Briefcase
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { ChatHistory } from "./chat-history"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator, useSidebar } from "@/components/ui/sidebar"

import { Skeleton } from "@/components/ui/skeleton"

// Real-time clock component - Client-side only rendering
function RealtimeClock() {
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    // Mark component as mounted to prevent hydration mismatch
    setIsMounted(true);

    // Update time every second
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Don't render anything on the server or during hydration
  if (!isMounted) {
    return (
      <div className="flex items-center justify-between w-full px-4 py-3 mt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium">Loading...</span>
        </div>
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Format date and time
  const formattedDate = dateTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // If sidebar is collapsed, either hide the clock or only show the icon
  if (isCollapsed) {
    return (
      <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full py-3 mt-2 border-t border-border">
        <Clock className="w-4 h-4 text-primary" />
      </div>
    );
  }

  // Full clock when sidebar is expanded
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 mt-2 border-b border-t border-border group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="font-medium">{formattedTime}</span>
      </div>
      <span className="text-xs text-muted-foreground">{formattedDate}</span>
    </div>
  );
}

export function AppSidebar({
  userData,
  ...props
}: {
  userData?: { name: string; email: string; image?: string; id?: string } | null
} & React.ComponentProps<typeof Sidebar>) {
  // Get current pathname to check which page we're on
  const pathname = usePathname()
  const isCareerCompassPage = pathname?.includes('/dashboard/career-compass')
  const isChatPage = pathname?.includes('/dashboard/chat')
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Use userData if available, otherwise fall back to sample data
  const data = {
    user: userData ? {
      name: userData.name,
      email: userData.email,
      avatar: userData.image || "/avatars/shadcn.jpg", // Map image to avatar
    } : {
      name: "Guest",
      email: "",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Career Compass ",
        url: "/dashboard/career-compass",
        icon: Compass,
        isActive: isCareerCompassPage,
      },

    ],
    additionals: [
      {
        title: "Aggregator",
        url: "/dashboard/aggregator",
        icon: LayoutDashboard,
        isActive: pathname?.includes('/dashboard/aggregator') || false,
      },
      {
        title: "Chatbot",
        url: "/dashboard/chat",
        icon: BotMessageSquareIcon,
        isActive: isChatPage,
      }
    ]
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3 mt-2 ml-4">

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full`}>
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <Link href="/dashboard" className="no-underline">
              <h1 className={`font-semibold text-base tracking-tight transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'} bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent`}>
                Employment Opportunities
              </h1>
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <NavMain items={data.navMain} groupLabel="AI Agents" />
        <NavMain items={data.additionals} groupLabel="Additionals" />

        {/* Show Chat History only on Chat page */}
        {isChatPage && (
          <>
            <div className="w-full overflow-hidden">
              <SidebarSeparator className="my-2 w-full max-w-full" />
            </div>

            {/* Use the ChatHistory component */}
            <Suspense fallback={
              <div className="px-2">
                <div className="text-xs font-medium text-muted-foreground px-3 py-1.5">Recent Chat</div>
                <div className="px-3 py-5">
                  <Skeleton className="h-5 w-full mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </div>
            }>
              <ChatHistory userId={userData?.id || 'anonymous'} />
            </Suspense>
          </>
        )}

        {/* Career Compass section, but without the chat history */}
        {isCareerCompassPage && (
          <>
            <div className="w-full overflow-hidden">
              <SidebarSeparator className="my-2 w-full max-w-full" />
            </div>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <RealtimeClock />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}