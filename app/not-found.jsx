"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Home, Search, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);

  // 创建随机星星
  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 20; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
      });
    }
    setStars(newStars);
  }, []);

  // 跟踪鼠标位置
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-b from-blue-400 to-purple-500">
      {/* 背景星星 */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute text-yellow-200"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: `${star.size}rem`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: star.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: star.delay,
          }}
        >
          ✦
        </motion.div>
      ))}

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          className="overflow-hidden bg-white border-4 border-white shadow-2xl rounded-3xl"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateX: position.y * 0.2,
            rotateY: position.x * 0.2,
          }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="p-6 text-center bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 sm:p-8">
            {/* 404数字 */}
            <motion.div
              className="text-[120px] sm:text-[150px] font-bold leading-none bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              404
            </motion.div>

            {/* 迷路的星星 */}
            <motion.div
              className="relative w-32 h-32 mx-auto mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <div className="relative">
                  <Star className="w-32 h-32 text-yellow-400 fill-yellow-400/50" />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-12 h-12 text-yellow-200" />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl font-bold text-white">?</div>
                  </div>
                </div>
              </motion.div>

              {/* 搜索图标 */}
              <motion.div
                className="absolute -right-4 -bottom-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  delay: 0.6,
                  duration: 0.5,
                  rotate: {
                    delay: 1,
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  },
                }}
              >
                <div className="p-2 bg-white rounded-full shadow-lg">
                  <Search className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
            </motion.div>

            <motion.h2
              className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              哎呀！星星迷路了
            </motion.h2>

            <motion.p
              className="mb-8 text-gray-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              我们找不到你要访问的页面，这颗小星星也找不到回家的路了。让我们一起回到首页吧！
            </motion.p>

            <motion.div
              className="flex flex-col justify-center gap-4 sm:flex-row"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                asChild
                className="text-white transition-all bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 hover:scale-105"
                size="lg"
              >
                <Link href="/dashboard">
                  <Home className="w-5 h-5 mr-2" />
                  返回首页
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
                size="lg"
              >
                <Link href="javascript:history.back()">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  返回上一页
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* 底部装饰 */}
          <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
        </motion.div>
      </div>

      {/* 装饰元素 */}
      <motion.div
        className="absolute bottom-10 right-10 text-white/30"
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Star className="w-20 h-20" />
      </motion.div>

      <motion.div
        className="absolute top-20 left-10 text-white/20"
        animate={{ rotate: -360 }}
        transition={{
          duration: 40,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Star className="w-16 h-16" />
      </motion.div>
    </div>
  );
}
