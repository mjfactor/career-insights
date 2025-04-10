import React from 'react'
import VideoDemo from "@/components/dashboard/VideoDemo"
import { ChevronRight } from "lucide-react"
const Dashboard = () => {
    const videoSources = {
        careerCompass: "/videos/career-compass-demo.mp4",
        aggregator: "/videos/aggregator-demo.mp4",
        chatbot: "/videos/chatbot-demo.mp4"
    }
    return (
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
        </main>
    )
}
export default Dashboard