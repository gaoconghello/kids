"use client"

import { useState } from "react"
import { X, User, Lock, Phone, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function AddParentDialog({ isOpen, onClose, onAdd, familyId }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!username.trim()) newErrors.username = "请输入用户名"
    if (!password) newErrors.password = "请输入密码"
    if (password.length < 6) newErrors.password = "密码长度至少为6位"
    if (password !== confirmPassword) newErrors.confirmPassword = "两次输入的密码不一致"
    if (!name.trim()) newErrors.name = "请输入姓名"
    if (!mobile.trim()) newErrors.mobile = "请输入手机号码"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // 调用API创建家长
      const response = await fetch('/api/parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          name,
          family_id: familyId,
          mobile,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 创建成功
        toast.success("家长添加成功")
        
        // 构建新家长对象并传递给onAdd回调
        const newParent = {
          id: result.data.id,
          username: result.data.username,
          name: result.data.name,
          mobile: mobile,
          avatar: "/placeholder.svg?height=40&width=40",
          familyId,
        }

        onAdd(newParent)

        // 重置表单
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        setName("")
        setMobile("")
        setErrors({})

        onClose()
      } else {
        // API返回错误
        toast.error(result.message || "添加家长失败")
      }
    } catch (error) {
      console.error("添加家长出错:", error)
      toast.error("添加家长时发生错误")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">添加家长</h2>
            <p className="text-sm text-muted-foreground">为家庭添加新的家长账户</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.username ? "border-red-500" : ""}`}
                  placeholder="请输入用户名"
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 pr-10 text-sm sm:text-base ${errors.password ? "border-red-500" : ""}`}
                  placeholder="请输入密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute w-8 h-8 right-1 top-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 pr-10 text-sm sm:text-base ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="请再次输入密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute w-8 h-8 right-1 top-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.name ? "border-red-500" : ""}`}
                  placeholder="请输入姓名"
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">手机号码</Label>
              <div className="relative">
                <Phone className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.mobile ? "border-red-500" : ""}`}
                  placeholder="请输入手机号码"
                />
              </div>
              {errors.mobile && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.mobile}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-purple-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "添加中..." : "添加家长"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

