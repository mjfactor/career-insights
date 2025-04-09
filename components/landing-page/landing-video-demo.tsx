"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Play, ChevronRight } from 'lucide-react'

interface LandingVideoDemoProps {
  videoSources: {
    careerCompass: string
    aggregator: string
    chatbot: string
  }
}

type FeatureKey = "career-compass" | "aggregator" | "chatbot";

export default function LandingVideoDemo({ videoSources }: LandingVideoDemoProps) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FeatureKey>("career-compass")

  const featureIcons: Record<FeatureKey, string> = {
    "career-compass": "🧭",
    "chatbot": "🤖",
    "aggregator": "🔍",
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {        
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  const cardVariants = {
    initial: { scale: 0.96, y: 10, opacity: 0 },
    animate: {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    },
    exit: {
      scale: 0.96,
      y: 10,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-6">
        {Object.entries(featureIcons).map(([key, icon]) => (
          <motion.div
            key={key}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(key as FeatureKey)}
            variants={itemVariants}
          >
            <div className={`cursor-pointer rounded-xl p-4 flex items-center gap-3 border-2 transition-all ${activeTab === key ? 'border-green-500 shadow-lg bg-green-500/5' : 'border-zinc-800'}`}>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${activeTab === key ? 'bg-green-500 text-black' : 'bg-zinc-900 text-zinc-400'}`}>
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium capitalize text-base text-white">{key.replace('-', ' ')}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={cardVariants}
          className="px-6"
        >
          {activeTab === "career-compass" && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-green-500/10 text-green-400 border-green-500/20">Career Compass</Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Career Navigation</h3>
                    <p className="text-zinc-300 mb-4 max-w-3xl">
                      Our intelligent compass analyzes your skills and experience to guide you toward optimal career paths,
                      identifying skill gaps and providing actionable development recommendations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 shadow-md bg-black relative group">
                      {!playing && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 group-hover:bg-black/50 transition-colors"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 text-black ml-1" />
                          </motion.div>
                        </motion.div>
                      )}
                      <video
                        src={videoSources.careerCompass}
                        className="h-full w-full object-cover"
                        controls={playing === 'careerCompass'}
                        onClick={() => {
                          if (!playing) {
                            setPlaying('careerCompass');
                            const video = document.querySelector('video');
                            if (video) video.play();
                          }
                        }}
                        onPlay={() => setPlaying('careerCompass')}
                        onPause={() => setPlaying(null)}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-4 text-white">Key Features</h3>
                    <div className="space-y-3">
                      {[
                        "Skill assessment and gap analysis with visual charts",
                        "Job fit scoring based on your professional profile",
                        "Personalized skill development recommendations",
                        "Salary benchmarking and growth potential insights"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 transition-all hover:border-green-500/30"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 }
                          }}
                        >
                          <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-zinc-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "aggregator" && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-green-500/10 text-green-400 border-green-500/20">Job Aggregator</Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">Smart Opportunity Finder</h3>
                    <p className="text-zinc-300 mb-4 max-w-3xl">
                      Our powerful aggregation engine collects and filters job opportunities from multiple sources,
                      creating a personalized feed of relevant positions matching your skills and career goals.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 shadow-md bg-black relative group">
                      {!playing && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 group-hover:bg-black/50 transition-colors"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 text-black ml-1" />
                          </motion.div>
                        </motion.div>
                      )}
                      <video
                        src={videoSources.aggregator}
                        className="h-full w-full object-cover"
                        controls={playing === 'aggregator'}
                        onClick={() => {
                          if (!playing) {
                            setPlaying('aggregator');
                            const video = document.querySelector('video');
                            if (video) video.play();
                          }
                        }}
                        onPlay={() => setPlaying('aggregator')}
                        onPause={() => setPlaying(null)}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-4 text-white">Key Features</h3>
                    <div className="space-y-3">
                      {[
                        "Multi-source job opportunities from across the web",
                        "Real-time updates and personalized notifications",
                        "Smart filtering and intelligent job matching",
                        "Application tracking and analytics dashboard"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 transition-all hover:border-green-500/30"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 }
                          }}
                        >
                          <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-zinc-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chatbot" && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-green-500/10 text-green-400 border-green-500/20">AI Chatbot</Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">Your Career Assistant</h3>
                    <p className="text-zinc-300 mb-4 max-w-3xl">
                      Our intelligent AI assistant provides personalized career advice, interview preparation,
                      and answers to your job search questions anytime you need guidance.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 shadow-md bg-black relative group">
                      {!playing && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 group-hover:bg-black/50 transition-colors"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 text-black ml-1" />
                          </motion.div>
                        </motion.div>
                      )}
                      <video
                        src={videoSources.chatbot}
                        className="h-full w-full object-cover"
                        controls={playing === 'chatbot'}
                        onClick={() => {
                          if (!playing) {
                            setPlaying('chatbot');
                            const video = document.querySelector('video');
                            if (video) video.play();
                          }
                        }}
                        onPlay={() => setPlaying('chatbot')}
                        onPause={() => setPlaying(null)}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-4 text-white">Key Features</h3>
                    <div className="space-y-3">
                      {[
                        "24/7 career guidance and personalized advice",
                        "Resume and cover letter feedback and optimization",
                        "Interview preparation and practice sessions",
                        "Customized skill development recommendations"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 transition-all hover:border-green-500/30"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 }
                          }}
                        >
                          <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-zinc-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
} 