"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Award, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error("请输入用户名和密码")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "登录失败")
      }
      
      // 保存token到localStorage
      localStorage.setItem("token", data.token)
      
      // 保存用户信息到localStorage
      localStorage.setItem("userInfo", JSON.stringify(data.user))
      
      // 根据用户角色跳转到不同的dashboard
      switch (data.user.role) {
        case "admin":
          toast.success("管理员登录成功")
          router.push("/admin")
          break
        case "parent":
          toast.success("家长登录成功")
          router.push("/parent")
          break
        case "child":
          toast.success("小朋友登录成功")
          router.push("/dashboard")
          break
        default:
          toast.success("登录成功")
          router.push("/dashboard")
      }
    } catch (error) {
      console.error("登录错误:", error)
      toast.error(error.message || "登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

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
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">星</div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl text-primary">小朋友积分乐园</h1>
          <p className="mb-6 text-base sm:mb-8 sm:text-lg text-muted-foreground">完成任务，赢取积分，兑换奖励！</p>

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
                <div
                  className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 group-hover:opacity-100 group-focus-within:opacity-100"
                />
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
                <div
                  className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 group-hover:opacity-100 group-focus-within:opacity-100"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-xl font-bold transition-transform sm:h-14 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:scale-105"
              disabled={isLoading}
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
  )
}

