"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Award, Gift, Sparkles, Unlock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const sliderRef = useRef(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error("请先完成滑动验证");
      return;
    }

    if (!username || !password) {
      toast.error("请输入用户名和密码");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "登录失败");
      }

      // 保存token到localStorage
      localStorage.setItem("token", data.token);

      // 保存用户信息到localStorage
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      // 跳转到仪表盘，使用 window.location.href 确保页面完全刷新
      window.location.href = "/dashboard";
      
    } catch (error) {
      console.error("登录错误:", error);
      toast.error(error.message || "登录失败，请重试");
      resetSlider();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    // 当滑动到最大值（100）时验证通过
    if (value === 100) {
      setIsVerified(true);
      toast.success("验证成功！");
    } else {
      setIsVerified(false);
    }
  };

  const resetSlider = () => {
    setSliderValue(0);
    setIsVerified(false);
  };

  // 登录失败或页面重新加载时重置滑动验证
  useEffect(() => {
    return () => resetSlider();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-3 sm:p-4">
      <div className="relative w-full max-w-md p-5 overflow-hidden bg-white shadow-2xl rounded-3xl sm:p-8">
        {/* Decorative elements */}
        <div className="absolute text-yellow-400 -top-6 -left-6">
          <Star className="w-12 h-12 sm:h-16 sm:w-16 fill-yellow-400 stroke-yellow-500" />
        </div>
        <div className="absolute text-yellow-400 -bottom-6 -right-6">
          <Star className="w-12 h-12 sm:h-16 sm:w-16 fill-yellow-400 stroke-yellow-500" />
        </div>
        <div className="absolute text-pink-400 top-1/4 right-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute text-blue-400 bottom-1/4 left-4 animate-pulse">
          <Gift className="w-8 h-8" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Award className="w-20 h-20 text-primary fill-primary/20" />
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                星
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl text-primary">
            小朋友积分乐园
          </h1>
          <p className="mb-6 text-base sm:mb-8 sm:text-lg text-muted-foreground">
            完成任务，赢取积分，兑换奖励！
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">
                你的名字
              </Label>
              <div className="relative group">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl border-2 border-primary/30 text-lg bg-white
                    transition-all duration-300 ease-in-out
                    focus:border-primary/50 focus:ring-0 focus:ring-offset-0
                    focus:outline-none focus:shadow-[0_0_0_1px_rgba(0,0,0,0.0)]
                    group-hover:border-primary/40"
                  placeholder="请输入你的名字"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 group-hover:opacity-100 group-focus-within:opacity-100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                密码
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-2 border-primary/30 text-lg bg-white
                    transition-all duration-300 ease-in-out
                    focus:border-primary/50 focus:ring-0 focus:ring-offset-0
                    focus:outline-none focus:shadow-[0_0_0_1px_rgba(0,0,0,0.0)]
                    group-hover:border-primary/40"
                  placeholder="请输入密码"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 group-hover:opacity-100 group-focus-within:opacity-100" />
              </div>
            </div>

            {/* 滑动验证组件 */}
            <div className="space-y-2">
              <Label htmlFor="slider" className="flex items-center gap-1 text-base">
                <Gift className="w-4 h-4 text-purple-500" />
                滑动小星星解锁
              </Label>
              <div className="relative overflow-hidden border-2 h-14 border-primary/30 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 group">
                {/* 背景装饰元素 */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  <div className="absolute top-1 left-[10%] w-4 h-4 bg-yellow-300 rounded-full" />
                  <div className="absolute top-6 left-[25%] w-2 h-2 bg-pink-300 rounded-full" />
                  <div className="absolute top-3 left-[40%] w-3 h-3 bg-blue-300 rounded-full" />
                  <div className="absolute top-8 left-[60%] w-2 h-2 bg-green-300 rounded-full" />
                  <div className="absolute top-2 left-[80%] w-3 h-3 bg-purple-300 rounded-full" />
                </div>
                
                <div className="relative w-full h-full p-2">
                  <input
                    ref={sliderRef}
                    type="range"
                    id="slider"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="absolute inset-0 z-30 w-full h-full opacity-0 cursor-pointer"
                    disabled={isVerified || isLoading}
                  />
                  
                  {/* 滑动进度条 */}
                  <div
                    style={{ width: `${sliderValue}%` }}
                    className="absolute top-0 left-0 z-10 h-full transition-all duration-300 rounded-md bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                  >
                    {/* 进度条装饰 */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1 left-[10%] w-4 h-4 bg-white opacity-20 rounded-full" />
                      <div className="absolute top-6 left-[30%] w-3 h-3 bg-white opacity-20 rounded-full" />
                      <div className="absolute top-2 left-[70%] w-5 h-5 bg-white opacity-20 rounded-full" />
                    </div>
                  </div>
                  
                  {/* 滑块 */}
                  <div
                    style={{ left: `calc(${sliderValue}% - ${sliderValue > 0 ? '18px' : '0px'})` }}
                    className="absolute z-20 flex items-center justify-center transition-all duration-300 transform -translate-y-1/2 top-1/2"
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md 
                      ${isVerified 
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 animate-pulse" 
                        : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
                    >
                      {isVerified ? (
                        <Star className="w-6 h-6 text-white fill-white" />
                      ) : (
                        <Star className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* 文字提示 */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <span className={`text-sm font-medium text-center transition-opacity duration-300
                      ${sliderValue > 30 ? "opacity-0" : "opacity-100"}
                      ${isVerified ? "text-transparent" : "text-gray-600"}`}>
                      {isVerified ? "验证成功" : "向右滑动小星星"}
                    </span>
                  </div>
                  
                  {/* 终点装饰 */}
                  <div className="absolute transform -translate-y-1/2 right-2 top-1/2 z-5">
                    <div className={`w-5 h-5 rounded-full ${isVerified ? "opacity-0" : "opacity-70"} transition-opacity duration-300`}>
                      <Gift className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 验证成功提示 */}
              {isVerified && (
                <div className="text-xs text-center text-green-500 animate-bounce">
                  太棒了！现在可以登录啦 ✨
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-xl font-bold transition-transform sm:h-14 rounded-xl 
                ${isVerified 
                  ? "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 shadow-lg shadow-primary/30" 
                  : "bg-gray-400 cursor-not-allowed"}`}
              disabled={isLoading || !isVerified}
            >
              {isLoading ? "登录中..." : "开始冒险！"}
            </Button>
          </form>

          <div className="flex justify-center mt-6 space-x-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 delay-100 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 delay-200 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 delay-300 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
