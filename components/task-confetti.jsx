"use client"

import confetti from "canvas-confetti"

export function createTaskConfetti() {
  // 从任务完成位置发射彩带
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors: ["#4F46E5", "#7C3AED", "#2563EB", "#8B5CF6", "#3B82F6"],
    gravity: 1.2,
    scalar: 0.7,
    ticks: 100,
  })
}

