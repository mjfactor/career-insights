"use client"

import type * as React from "react"
import {
  Compass,
  LayoutDashboard,
  FileText,
  Trash2,
  BotMessageSquareIcon
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Suspense } from "react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { ChatHistory } from "./chat-history"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar"

import { Skeleton } from "@/components/ui/skeleton"

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
        title: "Chat Bot",
        url: "/dashboard/chat",
        icon: BotMessageSquareIcon,
        isActive: isChatPage,
      },
      {
        title: "Career Compass",
        url: "/dashboard/career-compass",
        icon: Compass,
        isActive: isCareerCompassPage,
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

        {/* Show Chat History on Chat page */}
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

        {/* Only show History section on Career Compass page */}
        {isCareerCompassPage && (
          <>
            <div className="w-full overflow-hidden">
              <SidebarSeparator className="my-2 w-full max-w-full" />
            </div>

            {/* Use the ChatHistory component for Career Compass page as well */}
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}