"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Info, ChevronRight } from 'lucide-react'

interface VideoDemoProps {
  videoSources: {
    careerCompass: string
    aggregator: string
    chatbot: string
  }
}

type FeatureKey = "career-compass" | "aggregator" | "chatbot";

export default function VideoDemo({ videoSources }: VideoDemoProps) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FeatureKey>("career-compass")

  const featureIcons: Record<FeatureKey, string> = {
    "career-compass": "🧭",
    "aggregator": "🔍",
    "chatbot": "🤖"
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
      <motion.div
        variants={itemVariants}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-xl">
          <div className="bg-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎬
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Watch the Demo</h2>
                <p className="text-muted-foreground">Watch how our tools can transform your career journey</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(featureIcons).map(([key, icon]) => (
            <motion.div
              key={key}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(key as FeatureKey)}
            >
              <div className={`cursor-pointer rounded-xl p-4 flex items-center gap-3 border-2 transition-all ${activeTab === key ? 'border-primary shadow-lg bg-primary/5' : 'border-muted'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${activeTab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium capitalize text-base">{key.replace('-', ' ')}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-full">

                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={cardVariants}
        >
          {activeTab === "career-compass" && (
            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant="secondary" className="mb-2">Career Compass</Badge>
                    <CardTitle className="text-2xl">AI-Powered Career Navigation</CardTitle>
                    <CardDescription className="text-base mt-2 max-w-3xl">
                      Our intelligent compass analyzes your skills and experience to guide you toward optimal career paths,
                      identifying skill gaps and providing actionable development recommendations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="aspect-video w-full overflow-hidden rounded-xl shadow-md bg-muted relative group">
                      {!playing && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 group-hover:bg-black/40 transition-colors"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
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
                    <h3 className="text-lg font-medium mb-4">Core Features</h3>
                    <div className="space-y-4">
                      {[
                        "Skill assessment and gap analysis with visual charts",
                        "Job fit scoring based on your professional profile",
                        "Personalized skill development recommendations",
                        "Salary benchmarking and growth potential insights"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-card border transition-all hover:shadow-md"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 }
                          }}
                        >
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "aggregator" && (
            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant="secondary" className="mb-2">Job Aggregator</Badge>
                    <CardTitle className="text-2xl">Smart Opportunity Finder</CardTitle>
                    <CardDescription className="text-base mt-2 max-w-3xl">
                      Our powerful aggregation engine collects and filters job opportunities from multiple sources,
                      creating a personalized feed of relevant positions matching your skills and career goals.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="aspect-video w-full overflow-hidden rounded-xl shadow-md bg-muted relative group">
                      {!playing && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 group-hover:bg-black/40 transition-colors"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
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
                    <h3 className="text-lg font-medium mb-4">Core Features</h3>
                    <div className="space-y-4">
                      {[
                        "Multi-source job opportunities from across the web",
                        "Real-time updates and personalized notifications",
                        "Smart filtering and intelligent job matching",
                        "Application tracking and analytics dashboard"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-card border transition-all hover:shadow-md"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 }
                          }}
                        >
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "chatbot" && (
            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant="secondary" className="mb-2">AI Chatbot</Badge>
                    <CardTitle className="text-2xl">Your Career Assistant</CardTitle>
                    <CardDescription className="text-base mt-2 max-w-3xl">
                      Our intelligent AI assistant provides personalized career advice, interview preparation,
                      and answers to your job search questions anytime you need guidance.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="aspect-video w-full overflow-hidden rounded-xl shadow-md bg-muted relative group">
                      {!playing && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 group-hover:bg-black/40 transition-colors"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
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
                    <h3 className="text-lg font-medium mb-4">Core Features</h3>
                    <div className="space-y-4">
                      {[
                        "24/7 career guidance and personalized advice",
                        "Resume and cover letter feedback and optimization",
                        "Interview preparation and practice sessions",
                        "Customized skill development recommendations"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-card border transition-all hover:shadow-md"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.1 * index, duration: 0.3 }
                          }}
                        >
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
