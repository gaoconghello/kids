"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Award, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // 修改 handleLogin 函数来根据用户名判断角色
  const handleLogin = (e) => {
    e.preventDefault()
    // 根据用户名判断角色
    if (username === "c") {
      // 小朋友角色
      console.log("Logging in as child:", username)
      router.push("/dashboard")
    } else if (username === "p") {
      // 家长角色
      console.log("Logging in as parent:", username)
      router.push("/parent")
    } else if (username === "a") {
      // 管理员角色
      console.log("Logging in as admin:", username)
      router.push("/admin")
    } else {
      // 默认为小朋友角色
      console.log("Logging in as default child:", username)
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-5 sm:p-8 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 text-yellow-400">
          <Star className="h-12 w-12 sm:h-16 sm:w-16 fill-yellow-400 stroke-yellow-500" />
        </div>
        <div className="absolute -bottom-6 -right-6 text-yellow-400">
          <Star className="h-12 w-12 sm:h-16 sm:w-16 fill-yellow-400 stroke-yellow-500" />
        </div>
        <div className="absolute top-1/4 right-4 text-pink-400 animate-bounce">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="absolute bottom-1/4 left-4 text-blue-400 animate-pulse">
          <Gift className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Award className="h-20 w-20 text-primary fill-primary/20" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">星</div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-primary">小朋友积分乐园</h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground">完成任务，赢取积分，兑换奖励！</p>

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
                />
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-0 
                  transition-opacity duration-300 pointer-events-none
                  group-hover:opacity-100 group-focus-within:opacity-100"
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
                />
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-0 
                  transition-opacity duration-300 pointer-events-none
                  group-hover:opacity-100 group-focus-within:opacity-100"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 sm:h-14 w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 text-xl font-bold transition-transform hover:scale-105"
            >
              开始冒险！
            </Button>
          </form>

          <div className="mt-6 flex justify-center space-x-4">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse delay-100"></div>
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse delay-200"></div>
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

