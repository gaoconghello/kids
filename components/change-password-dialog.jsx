"use client"

import { useState } from "react"
import { X, Lock, Eye, EyeOff, Check, AlertTriangle, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// 添加一个计算密码强度的函数
function calculatePasswordStrength(password) {
  if (!password) return 0

  let strength = 0

  // 长度检查
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15

  // 复杂性检查
  if (/[a-z]/.test(password)) strength += 15 // 小写字母
  if (/[A-Z]/.test(password)) strength += 15 // 大写字母
  if (/[0-9]/.test(password)) strength += 15 // 数字
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15 // 特殊字符

  return Math.min(100, strength)
}

// 获取密码强度的描述和颜色
function getPasswordStrengthInfo(strength) {
  if (strength < 30) return { text: "非常弱", color: "bg-red-500", icon: AlertTriangle, iconColor: "text-red-500" }
  if (strength < 50) return { text: "弱", color: "bg-orange-500", icon: ShieldAlert, iconColor: "text-orange-500" }
  if (strength < 70) return { text: "中等", color: "bg-yellow-500", icon: ShieldAlert, iconColor: "text-yellow-500" }
  if (strength < 90) return { text: "强", color: "bg-green-500", icon: ShieldCheck, iconColor: "text-green-500" }
  return { text: "非常强", color: "bg-green-600", icon: ShieldCheck, iconColor: "text-green-600" }
}

export function ChangePasswordDialog({ isOpen, onClose, onSubmit, userType = "child" }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 添加密码强度状态
  const passwordStrength = calculatePasswordStrength(newPassword)
  const strengthInfo = getPasswordStrengthInfo(passwordStrength)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // 简单的验证
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("请填写所有密码字段")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("新密码和确认密码不匹配")
      return
    }

    if (newPassword.length < 6) {
      setError("新密码长度至少为6位")
      return
    }

    // 添加密码强度验证
    if (passwordStrength < 50) {
      setError("密码强度太弱，请创建更强的密码")
      return
    }

    try {
      setIsSubmitting(true)
      
      // 调用父组件的提交函数
      const result = await onSubmit?.({ currentPassword, newPassword })
      
      // 根据返回结果判断是否成功
      if (result && typeof result === 'object') {
        if (result.success) {
          // API调用成功，显示成功消息
          setSuccess(true)
          // 2秒后关闭对话框
          setTimeout(() => {
            resetForm()
            onClose()
          }, 2000)
        } else {
          // API调用失败，显示错误消息
          setError(result.message || "密码修改失败")
        }
      } else {
        // 如果没有返回值或返回值不是对象，假设成功（向后兼容）
        setSuccess(true)
        // 2秒后关闭对话框
        setTimeout(() => {
          resetForm()
          onClose()
        }, 2000)
      }
    } catch (error) {
      // 捕获其他错误
      setError("修改密码时出错，请稍后再试")
      console.error("修改密码出错:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100"
            onClick={() => {
              resetForm()
              onClose()
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">修改密码</h2>
            <p className="text-sm text-muted-foreground">
              {userType === "parent" ? "更新您的家长账户密码" : "更新你的密码，保护账户安全"}
            </p>
          </div>

          {success ? (
            <div className="p-4 mb-6 text-center rounded-lg bg-green-50">
              <div className="flex justify-center mb-2">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-800">密码修改成功！</h3>
              <p className="text-green-600">您的密码已经成功更新</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && <div className="p-3 text-sm text-red-600 rounded-lg bg-red-50">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 pl-10 pr-10 text-sm sm:h-12 sm:text-base"
                    placeholder="输入当前密码"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute w-8 h-8 right-1 top-1"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 pl-10 pr-10 text-sm sm:h-12 sm:text-base"
                    placeholder="输入新密码"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute w-8 h-8 right-1 top-1"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>

                {/* 添加密码强度提示 */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <strengthInfo.icon className={`h-4 w-4 ${strengthInfo.iconColor}`} />
                        <span className="text-sm text-gray-600">
                          密码强度：<span className={`font-medium ${strengthInfo.iconColor}`}>{strengthInfo.text}</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{passwordStrength}%</span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" indicatorClassName={strengthInfo.color} />

                    {/* 密码要求提示 */}
                    <div className="p-2 mt-2 text-xs text-blue-700 rounded-md bg-blue-50">
                      <p className="font-medium">强密码应包含：</p>
                      <ul className="pl-4 mt-1 space-y-1">
                        <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? "text-green-600" : ""}`}>
                          {newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <span>•</span>} 至少8个字符
                        </li>
                        <li className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? "text-green-600" : ""}`}>
                          {/[A-Z]/.test(newPassword) ? <Check className="w-3 h-3" /> : <span>•</span>} 大写字母
                        </li>
                        <li className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? "text-green-600" : ""}`}>
                          {/[a-z]/.test(newPassword) ? <Check className="w-3 h-3" /> : <span>•</span>} 小写字母
                        </li>
                        <li className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? "text-green-600" : ""}`}>
                          {/[0-9]/.test(newPassword) ? <Check className="w-3 h-3" /> : <span>•</span>} 数字
                        </li>
                        <li
                          className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(newPassword) ? "text-green-600" : ""}`}
                        >
                          {/[^a-zA-Z0-9]/.test(newPassword) ? <Check className="w-3 h-3" /> : <span>•</span>} 特殊字符
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 pl-10 pr-10 text-sm sm:h-12 sm:text-base"
                    placeholder="再次输入新密码"
                    required
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
                {/* 添加密码匹配提示 */}
                {confirmPassword && newPassword && (
                  <div
                    className={`mt-1 flex items-center gap-1 text-sm ${
                      confirmPassword === newPassword ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {confirmPassword === newPassword ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>密码匹配</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>密码不匹配</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-purple-600" 
              disabled={success || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : success ? "已更新" : "更新密码"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

