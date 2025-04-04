"use client"

import type * as React from "react"
import {
  Compass,
  LayoutDashboard,
  FileText,
  Trash2,
  BotMessageSquareIcon,
  Clock
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Suspense, useState, useEffect } from "react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { ChatHistory } from "./chat-history"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar"

import { Skeleton } from "@/components/ui/skeleton"

// Real-time clock component - Client-side only rendering
function RealtimeClock() {
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);

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
      <div className="flex items-center justify-between w-full px-4 py-3 mt-2  border-t border-border">
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

  return (
    <div className="flex items-center justify-between w-full px-4 py-3 mt-2 border-b border-t border-border">
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
      // Direct access to Career Compass and Aggregator
      {
        title: "Career Compass",
        url: "/dashboard/career-compass",
        icon: Compass,
        isActive: isCareerCompassPage,
      },
      {
        title: "Chat Bot",
        url: "/dashboard/chat",
        icon: BotMessageSquareIcon,
        isActive: isChatPage,
      },
      {
        title: "Aggregator",
        url: "/dashboard/aggregator",
        icon: LayoutDashboard,
        isActive: pathname?.includes('/dashboard/aggregator') || false,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <NavMain items={data.navMain} />

        {/* Show Chat History only on Chat page */}
        {isChatPage && (
          <>
            <div className="w-full overflow-hidden">
              <SidebarSeparator className="my-2 w-full max-w-full" />
            </div>

            {/* Use the ChatHistory component */}
            <Suspense fallback={
              <SidebarGroup>
                <SidebarGroupLabel>Recent Chat</SidebarGroupLabel>
                <div className="px-3 py-5">
                  <Skeleton className="h-5 w-full mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </SidebarGroup>
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