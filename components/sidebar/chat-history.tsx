"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { FileText, Trash2, Loader2 } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { toast } from "sonner"

const HISTORY_UPDATE_EVENT = "chat-history-update"

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { clearChats, getChats } from "@/lib/actions/chat"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Chat {
    id: string
    title: string
    path: string
    messages: any[]
    createdAt: Date
    userId: string
}

export function ChatHistory({ userId }: { userId: string }) {
    const [chatHistory, setChatHistory] = useState<Chat[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isClearing, setIsClearing] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const fetchChatHistory = async () => {
        try {
            setIsLoading(true)
            const chats = await getChats(userId)
            // Convert createdAt strings to Date objects
            const formattedChats = chats.map(chat => ({
                ...chat,
                createdAt: new Date(chat.createdAt)
            }))
            setChatHistory(formattedChats)
        } catch (error) {
            console.error("Failed to fetch chat history:", error)
            toast.error("Failed to load chat history")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchChatHistory()

        // Set up event listener for history updates
        const handleHistoryUpdate = () => {
            fetchChatHistory()
        }

        window.addEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate)

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate)
        }
    }, [userId])

    // Refresh history when path changes (navigating between chats)
    useEffect(() => {
        fetchChatHistory()
    }, [pathname])

    const handleClearHistory = async () => {
        try {
            setIsClearing(true)
            const result = await clearChats(userId, false) // Pass false to avoid redirect

            if (result.success) {
                setChatHistory([])
                toast.success("Chat history cleared successfully")
                // Navigate to the main chat page without full refresh
                router.push('/dashboard/chat/')
            } else if (result.error) {
                toast.error(result.error)
            }
        } catch (error) {
            console.error("Failed to clear chat history:", error)
            toast.error("Failed to clear chat history")
        } finally {
            setIsClearing(false)
        }
    }

    const formatDate = (date: Date) => {
        if (isToday(date)) {
            return `Today, ${format(date, "h:mm a")}`
        } else if (isYesterday(date)) {
            return "Yesterday"
        } else {
            return format(date, "MMM d, yyyy")
        }
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Recent Chat History</SidebarGroupLabel>
            <SidebarMenu className="space-y-1.5">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : chatHistory.length > 0 ? (
                    <>
                        {chatHistory.map((chat) => (
                            <SidebarMenuItem key={chat.id} className="overflow-hidden">
                                <SidebarMenuButton
                                    tooltip={chat.title}
                                    className="py-2"
                                    onClick={() => router.push(chat.path)}
                                >
                                    <FileText className="h-4 w-4 shrink-0" />
                                    <span className="flex flex-col overflow-hidden">
                                        <span className="text-sm truncate">{chat.title}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(new Date(chat.createdAt))}
                                        </span>
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </>
                ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                        No chat history found
                    </div>
                )}

                {chatHistory.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <SidebarMenuItem className="overflow-hidden">
                                <SidebarMenuButton
                                    tooltip="Clear history"
                                    className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    disabled={isClearing}
                                >
                                    {isClearing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <span className="truncate">Clearing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 shrink-0 mr-2" />
                                            <span className="truncate">Clear history</span>
                                        </>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to clear your entire chat history? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleClearHistory}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isClearing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Clearing...
                                        </>
                                    ) : (
                                        "Clear History"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}

// Export the event name for use in other components
export { HISTORY_UPDATE_EVENT }