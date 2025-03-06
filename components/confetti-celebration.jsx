"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"

export function ConfettiCelebration({ onComplete }) {
  useEffect(() => {
    // 创建左侧彩带
    const leftConfetti = () => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
      })
    }

    // 创建右侧彩带
    const rightConfetti = () => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
      })
    }

    // 创建中间彩带
    const centerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
      })
    }

    // 执行动画序列
    const runAnimation = () => {
      setTimeout(leftConfetti, 0)
      setTimeout(rightConfetti, 100)
      setTimeout(centerConfetti, 200)
      setTimeout(leftConfetti, 400)
      setTimeout(rightConfetti, 500)
      setTimeout(centerConfetti, 600)
    }

    // Try to play sound if available
    try {
      const audio = new Audio("/success.mp3")
      audio.volume = 0.5
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Audio playback failed:", error)
        })
      }
    } catch (error) {
      console.log("Audio creation failed:", error)
    }

    // 运行动画
    runAnimation()

    // 3秒后通知动画完成
    const timer = setTimeout(() => {
      onComplete?.()
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 半透明背景 */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

        {/* 中央内容区域 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="relative z-10"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: 2,
              ease: "easeInOut",
            }}
            className="rounded-2xl bg-white p-5 sm:p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-75 blur-md"
                />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-400">
                  <Star className="h-8 w-8 fill-white text-white" />
                </div>
              </div>
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl font-bold text-gray-800"
                >
                  太棒了！完成所有任务
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-yellow-500"
                >
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-500" />
                  <span>+50 积分</span>
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-500" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 装饰性星星 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.cos((i * Math.PI) / 4) * 100,
              y: Math.sin((i * Math.PI) / 4) * 100,
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: 1,
              repeatType: "reverse",
            }}
            className="absolute left-1/2 top-1/2"
          >
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-500" />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}

