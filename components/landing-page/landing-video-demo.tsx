"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Play, ChevronRight } from 'lucide-react'

interface LandingVideoDemoProps {
  videoSources: {
    careerCompass: string
  }
}

export default function LandingVideoDemo({ videoSources }: LandingVideoDemoProps) {
  const [playing, setPlaying] = useState<string | null>(null)

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
        initial="initial"
        animate="animate"
        variants={cardVariants}
        className="px-6"
      >
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
      </motion.div>
    </motion.div>
  )
} 