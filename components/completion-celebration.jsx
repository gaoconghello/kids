"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Star, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CompletionCelebration({ onClose }) {
  const [show, setShow] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const audioRef = useRef(null)
  const confettiInterval = useRef(null)

  // 创建彩带效果
  const createConfetti = () => {
    const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00FF00", "#4169E1"]
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    })
  }

  // 创建连续的彩带效果
  const startConfettiInterval = () => {
    createConfetti()
    confettiInterval.current = setInterval(createConfetti, 2000)
  }

  useEffect(() => {
    setShow(true)
    setShowFireworks(true)
    startConfettiInterval()

    // 播放庆祝音效
    audioRef.current = new Audio("/celebration.mp3") // 需要添加一个欢快的音效文件
    audioRef.current.play()

    const timer = setTimeout(() => {
      setShow(false)
      onClose?.()
    }, 8000)

    return () => {
      clearTimeout(timer)
      clearInterval(confettiInterval.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景模糊和渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm" />

      {/* 主要内容 */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative"
      >
        {/* 装饰性气球 */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="relative"
          >
            <div className="h-24 w-20 rounded-full bg-red-500" />
            <div className="absolute bottom-0 left-1/2 h-8 w-1 -translate-x-1/2 bg-gray-300" />
          </motion.div>
        </div>

        {/* 左侧气球 */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
            className="relative"
          >
            <div className="h-16 w-14 rounded-full bg-blue-500" />
            <div className="absolute bottom-0 left-1/2 h-6 w-1 -translate-x-1/2 bg-gray-300" />
          </motion.div>
        </div>

        {/* 右侧气球 */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
            className="relative"
          >
            <div className="h-16 w-14 rounded-full bg-yellow-500" />
            <div className="absolute bottom-0 left-1/2 h-6 w-1 -translate-x-1/2 bg-gray-300" />
          </motion.div>
        </div>

        {/* 主卡片 */}
        <motion.div
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="relative overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="relative z-10 px-6 sm:px-12 py-6 sm:py-8">
            {/* 奖杯动画 */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <Trophy className="h-24 w-24 sm:h-32 sm:w-32 text-yellow-400" />
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles className="h-16 w-16 text-yellow-200" />
                </motion.div>
              </div>
            </motion.div>

            {/* 文字内容 */}
            <div className="text-center">
              <motion.h2
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="mb-2 text-3xl sm:text-4xl font-bold text-primary"
              >
                哇！太棒了！
              </motion.h2>
              <p className="mb-6 text-xl text-gray-600">今天的作业全部完成啦！</p>

              {/* 奖励展示 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-4 sm:px-6 py-2 sm:py-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 animate-pulse fill-yellow-400 text-yellow-500" />
                    <span className="text-lg sm:text-xl font-bold text-yellow-600">获得额外奖励 50 积分！</span>
                    <Star className="h-6 w-6 animate-pulse fill-yellow-400 text-yellow-500" />
                  </div>
                  {/* 装饰性闪光 */}
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute -right-2 -top-2"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                    className="absolute -left-2 -top-2"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>

              {/* 动态表情 */}
              <div className="mb-6 flex justify-center space-x-4 text-4xl">
                <motion.span
                  animate={{ rotate: [0, -20, 20, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  🎉
                </motion.span>
                <motion.span
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                >
                  🌟
                </motion.span>
                <motion.span
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  🎈
                </motion.span>
              </div>

              {/* 关闭按钮 */}
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-primary to-purple-600 px-8 py-2 text-lg font-semibold text-white transition-all hover:scale-105"
              >
                太棒了！
              </Button>
            </div>
          </div>

          {/* 装饰性背景元素 */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-0 top-0 h-32 w-32 animate-spin-slow origin-bottom-right opacity-20">
              <div className="h-full w-1 bg-gradient-to-b from-primary to-transparent"></div>
            </div>
            <div className="absolute right-0 top-0 h-32 w-32 animate-spin-slow origin-bottom-left opacity-20">
              <div className="h-full w-1 bg-gradient-to-b from-purple-500 to-transparent"></div>
            </div>
          </div>
        </motion.div>

        {/* 漂浮的星星 */}
        <div className="absolute inset-0 -z-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
              className="absolute"
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

