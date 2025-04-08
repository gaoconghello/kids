"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Coffee, BookOpen, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PomodoroTimer({ onComplete, onCancel, currentTask }) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [time, setTime] = useState(1 * 60) // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(1 * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(currentTask?.pomodoro || 0)
  const [waitingForBreak, setWaitingForBreak] = useState(false)
  const [waitingForFocus, setWaitingForFocus] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true) // 音效开关状态，默认开启
  const intervalRef = useRef(null)
  const hasCalledOnComplete = useRef(false) // 跟踪是否已经调用过onComplete

  // Sound effects
  const timerCompleteSound = useRef(null)
  const breakCompleteSound = useRef(null)
  const tickingSound = useRef(null)

  useEffect(() => {
    // Initialize audio elements - 暂时注释掉音频初始化
    timerCompleteSound.current = new Audio("/timer-complete.mp3")
    breakCompleteSound.current = new Audio("/break-complete.mp3")
    tickingSound.current = new Audio("/ticking.mp3")
    
    // 设置滴答声循环播放
    if (tickingSound.current) {
      tickingSound.current.loop = true
    }

    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) clearInterval(intervalRef.current)
      // 停止所有音频
      if (tickingSound.current) tickingSound.current.pause()
    }
  }, [])

  // 控制滴答声的播放和暂停
  useEffect(() => {
    if (isActive && !isPaused && !isBreak && soundEnabled) {
      // 专注时间时播放滴答声，且音效开启时
      tickingSound.current?.play()
    } else {
      // 休息时间或暂停时停止滴答声
      tickingSound.current?.pause()
    }
  }, [isActive, isPaused, isBreak, soundEnabled])

  useEffect(() => {
    if (currentTask?.pomodoro !== undefined) {
      console.log('PomodoroTimer - 更新番茄钟数量:', currentTask.pomodoro);
      setCompletedPomodoros(currentTask.pomodoro)
    }
  }, [currentTask])

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current)

            // 只有在开启音效的情况下才播放声音
            if (soundEnabled) {
              if (isBreak) {
                breakCompleteSound.current?.play()
              } else {
                timerCompleteSound.current?.play()
              }
            }

            if (isBreak) {
              // 休息结束，等待用户开始新的专注
              setIsActive(false)
              setWaitingForFocus(true)
              // 重置onComplete调用标志，以便下一次可以调用
              hasCalledOnComplete.current = false
            } else {
              // 专注结束，等待用户开始休息
              setIsActive(false)
              setWaitingForBreak(true)
              
              // 使用ref检查是否已经调用过onComplete
              if (onComplete && !hasCalledOnComplete.current) {
                hasCalledOnComplete.current = true // 标记为已调用
                // 仍然使用setTimeout避免在渲染周期中更新父组件状态
                setTimeout(() => {
                  onComplete();
                }, 0);
              }
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
  }, [isActive, isPaused, isBreak, onComplete, soundEnabled])

  const startTimer = () => {
    setIsActive(true)
    setIsPaused(false)
    // 开始专注时播放滴答声，但仅在音效开启时
    if (!isBreak && soundEnabled) {
      tickingSound.current?.play()
    }
  }

  const pauseTimer = () => {
    setIsPaused(true)
    clearInterval(intervalRef.current)
    // 暂停时停止滴答声
    tickingSound.current?.pause()
  }

  const resumeTimer = () => {
    setIsPaused(false)
    // 继续专注时重新播放滴答声，但仅在音效开启时
    if (!isBreak && soundEnabled) {
      tickingSound.current?.play()
    }
  }

  const resetTimer = () => {
    clearInterval(intervalRef.current)
    setIsActive(false)
    setIsPaused(false)
    setIsBreak(false)
    setWaitingForBreak(false)
    setWaitingForFocus(false)
    setTime(1 * 60)
    setInitialTime(1 * 60)
    // 重置调用标志
    hasCalledOnComplete.current = false
    
    // 停止滴答声
    tickingSound.current?.pause()
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
    
    // 休息时停止滴答声
    tickingSound.current?.pause()
  }

  const startFocus = () => {
    setIsBreak(false)
    setWaitingForFocus(false)
    setTime(25 * 60)
    setInitialTime(25 * 60)
    setIsActive(true)
    setIsPaused(false)
    
    // 开始专注时播放滴答声，但仅在音效开启时
    if (soundEnabled) {
      tickingSound.current?.play()
    }
  }

  // 切换音效开关状态
  const toggleSound = () => {
    setSoundEnabled(prev => !prev)
    
    // 如果当前正在播放滴答声，根据新状态决定是否停止
    if (!soundEnabled && isActive && !isPaused && !isBreak) {
      // 如果开启音效，且处于专注计时中，则播放滴答声
      tickingSound.current?.play()
    } else if (soundEnabled) {
      // 如果关闭音效，停止所有声音
      tickingSound.current?.pause()
    }
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
    <div className="relative p-6 overflow-hidden border-2 border-red-200 rounded-2xl bg-gradient-to-b from-red-50 to-white">
      {/* 装饰性背景元素 */}
      <div className="absolute w-24 h-24 bg-red-100 rounded-full opacity-50 -right-8 -top-8"></div>
      <div className="absolute w-24 h-24 bg-red-100 rounded-full opacity-50 -left-8 -bottom-8"></div>

      <div className="relative">
        {/* 当前作业信息 */}
        <div className="p-3 mb-4 border border-red-100 sm:mb-6 rounded-xl bg-white/80 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-lg shrink-0 bg-red-50">
              <BookOpen className="w-5 h-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-red-600">{currentTask?.subject}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">预计用时 {currentTask?.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{currentTask?.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>截止时间：{currentTask?.deadline}</span>
                <Badge variant="outline" className="border-yellow-200 bg-yellow-50">
                  <span className="text-yellow-600">+{currentTask?.points} 积分</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
              {isBreak ? <span className="text-2xl">☕️</span> : <span className="text-2xl">🍅</span>}
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-600">{isBreak ? "休息时间" : "专注时间"}</h3>
              <p className="text-sm text-red-500">{isBreak ? "放松一下眼睛和大脑吧！" : "保持专注，你做得很棒！"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={toggleSound} 
              variant="ghost" 
              size="sm" 
              className={`p-2 rounded-full hover:bg-red-50 ${soundEnabled ? 'text-red-500' : 'text-gray-400'}`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-red-200 bg-red-50">
              <span className="text-red-600">🍅 x {completedPomodoros}</span>
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* 外圈装饰 */}
            <div className="absolute rounded-full -inset-4 bg-gradient-to-r from-red-200 to-pink-200 opacity-20 blur-lg"></div>

            {/* 时间显示容器 */}
            <div className="relative flex items-center justify-center bg-white border-4 border-red-100 rounded-full shadow-inner h-28 w-28 sm:h-32 sm:w-32">
              {/* 进度圆环 */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="stroke-red-100" cx="50" cy="50" r="46" strokeWidth="8" fill="none" />
                <circle
                  className="transition-all duration-1000 ease-linear stroke-red-400"
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
                <span className="text-2xl font-bold text-red-500 sm:text-3xl">{formatTime(time)}</span>
                <div className="mt-1 text-xs text-red-400">{isBreak ? "休息中..." : "专注中..."}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {waitingForBreak ? (
            <Button
              onClick={startBreak}
              className="text-white bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500"
              size="sm"
            >
              <Coffee className="w-4 h-4 mr-1" />
              开始休息
            </Button>
          ) : waitingForFocus ? (
            <Button
              onClick={startFocus}
              className="text-white bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              开始专注
            </Button>
          ) : !isActive ? (
            <Button
              onClick={startTimer}
              className="text-white bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              开始专注
            </Button>
          ) : isPaused ? (
            <Button
              onClick={resumeTimer}
              className="text-white bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              继续
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-1" />
              暂停
            </Button>
          )}

          <Button
            onClick={resetTimer}
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </Button>

          <Button
            onClick={cancelTimer}
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            size="sm"
          >
            取消
          </Button>
        </div>

        {/* 可爱的提示信息 */}
        <div className="p-3 mt-4 text-sm text-center text-red-600 rounded-xl bg-red-50">
          {isBreak ? (
            <div className="flex items-center justify-center gap-2">
              <Coffee className="w-4 h-4" />
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

