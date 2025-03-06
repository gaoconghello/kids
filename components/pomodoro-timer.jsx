"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PomodoroTimer({ onComplete, onCancel, currentTask }) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [time, setTime] = useState(1 * 60) // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(1 * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [waitingForBreak, setWaitingForBreak] = useState(false)
  const [waitingForFocus, setWaitingForFocus] = useState(false)
  const intervalRef = useRef(null)

  // Sound effects
  const timerCompleteSound = useRef(null)
  const breakCompleteSound = useRef(null)

  useEffect(() => {
    // Initialize audio elements
    timerCompleteSound.current = new Audio("/timer-complete.mp3")
    breakCompleteSound.current = new Audio("/break-complete.mp3")

    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current)

            // 播放声音
            if (isBreak) {
              breakCompleteSound.current?.play()
              // 休息结束，等待用户开始新的专注
              setIsActive(false)
              setWaitingForFocus(true)
            } else {
              timerCompleteSound.current?.play()
              // 专注结束，等待用户开始休息
              setIsActive(false)
              setWaitingForBreak(true)
              setCompletedPomodoros((prev) => prev + 1)
              if (onComplete) onComplete()
            }

            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, isPaused, isBreak, onComplete])

  const startTimer = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
    clearInterval(intervalRef.current)
  }

  const resumeTimer = () => {
    setIsPaused(false)
  }

  const resetTimer = () => {
    clearInterval(intervalRef.current)
    setIsActive(false)
    setIsPaused(false)
    setIsBreak(false)
    setWaitingForBreak(false)
    setWaitingForFocus(false)
    setTime(25 * 60)
    setInitialTime(25 * 60)
  }

  const cancelTimer = () => {
    resetTimer()
    if (onCancel) onCancel()
  }

  const startBreak = () => {
    setIsBreak(true)
    setWaitingForBreak(false)
    setTime(5 * 60)
    setInitialTime(5 * 60)
    setIsActive(true)
    setIsPaused(false)
  }

  const startFocus = () => {
    setIsBreak(false)
    setWaitingForFocus(false)
    setTime(25 * 60)
    setInitialTime(25 * 60)
    setIsActive(true)
    setIsPaused(false)
  }

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progress = ((initialTime - time) / initialTime) * 100

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-b from-red-50 to-white p-6">
      {/* 装饰性背景元素 */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100 opacity-50"></div>
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-red-100 opacity-50"></div>

      <div className="relative">
        {/* 当前作业信息 */}
        <div className="mb-4 sm:mb-6 rounded-xl border border-red-100 bg-white/80 p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <BookOpen className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-red-600">{currentTask?.subject}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">预计用时 {currentTask?.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{currentTask?.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>截止时间：{currentTask?.deadline}</span>
                <Badge variant="outline" className="border-yellow-200 bg-yellow-50">
                  <span className="text-yellow-600">+{currentTask?.points} 积分</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              {isBreak ? <span className="text-2xl">☕️</span> : <span className="text-2xl">🍅</span>}
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-600">{isBreak ? "休息时间" : "专注时间"}</h3>
              <p className="text-sm text-red-500">{isBreak ? "放松一下眼睛和大脑吧！" : "保持专注，你做得很棒！"}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 px-3 py-1">
            <span className="text-red-600">🍅 x {completedPomodoros}</span>
          </Badge>
        </div>

        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            {/* 外圈装饰 */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-red-200 to-pink-200 opacity-20 blur-lg"></div>

            {/* 时间显示容器 */}
            <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-4 border-red-100 bg-white shadow-inner">
              {/* 进度圆环 */}
              <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle className="stroke-red-100" cx="50" cy="50" r="46" strokeWidth="8" fill="none" />
                <circle
                  className="stroke-red-400 transition-all duration-1000 ease-linear"
                  cx="50"
                  cy="50"
                  r="46"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="289.02652413026095"
                  strokeDashoffset={289.02652413026095 * (1 - progress / 100)}
                />
              </svg>

              {/* 时间显示 */}
              <div className="relative z-10 text-center">
                <span className="text-2xl sm:text-3xl font-bold text-red-500">{formatTime(time)}</span>
                <div className="mt-1 text-xs text-red-400">{isBreak ? "休息中..." : "专注中..."}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {waitingForBreak ? (
            <Button
              onClick={startBreak}
              className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white hover:from-blue-500 hover:to-indigo-500"
              size="sm"
            >
              <Coffee className="mr-1 h-4 w-4" />
              开始休息
            </Button>
          ) : waitingForFocus ? (
            <Button
              onClick={startFocus}
              className="bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500"
              size="sm"
            >
              <Play className="mr-1 h-4 w-4" />
              开始专注
            </Button>
          ) : !isActive ? (
            <Button
              onClick={startTimer}
              className="bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500"
              size="sm"
            >
              <Play className="mr-1 h-4 w-4" />
              开始专注
            </Button>
          ) : isPaused ? (
            <Button
              onClick={resumeTimer}
              className="bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500"
              size="sm"
            >
              <Play className="mr-1 h-4 w-4" />
              继续
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50"
              size="sm"
            >
              <Pause className="mr-1 h-4 w-4" />
              暂停
            </Button>
          )}

          <Button
            onClick={resetTimer}
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50"
            size="sm"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            重置
          </Button>

          <Button
            onClick={cancelTimer}
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50"
            size="sm"
          >
            取消
          </Button>
        </div>

        {/* 可爱的提示信息 */}
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
          {isBreak ? (
            <div className="flex items-center justify-center gap-2">
              <Coffee className="h-4 w-4" />
              <span>休息一下，让眼睛和大脑放松~</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-base">🎯</span>
              <span>保持专注，你可以的！加油！</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

