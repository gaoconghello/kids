"use client"

import { useState } from "react"
import { X, User, Lock, Eye, EyeOff, AlertTriangle, GraduationCap, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddChildDialog({ isOpen, onClose, onAdd, familyId }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [gender, setGender] = useState("male")
  const [age, setAge] = useState("")
  const [grade, setGrade] = useState("")
  const [initialPoints, setInitialPoints] = useState("0")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!username.trim()) newErrors.username = "请输入用户名"
    if (!password) newErrors.password = "请输入密码"
    if (password.length < 6) newErrors.password = "密码长度至少为6位"
    if (password !== confirmPassword) newErrors.confirmPassword = "两次输入的密码不一致"
    if (!name.trim()) newErrors.name = "请输入姓名"
    if (!age.trim()) newErrors.age = "请输入年龄"
    if (isNaN(Number(age)) || Number(age) <= 0) newErrors.age = "请输入有效的年龄"
    if (!grade) newErrors.grade = "请选择年级"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const newChild = {
      id: Date.now(),
      username,
      name,
      gender,
      age: Number(age),
      grade,
      points: Number(initialPoints),
      avatar: "/placeholder.svg?height=40&width=40",
      familyId,
    }

    onAdd(newChild)

    // 重置表单
    setUsername("")
    setPassword("")
    setConfirmPassword("")
    setName("")
    setGender("male")
    setAge("")
    setGrade("")
    setInitialPoints("0")
    setErrors({})

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">添加孩子</h2>
            <p className="text-sm text-muted-foreground">为家庭添加新的孩子账户</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>性别</Label>
              <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">
                    男
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">
                    女
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.age ? "border-red-500" : ""}`}
                    placeholder="请输入年龄"
                  />
                </div>
                {errors.age && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{errors.age}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">年级</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger
                      className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.grade ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">幼儿园</SelectItem>
                      <SelectItem value="grade1">一年级</SelectItem>
                      <SelectItem value="grade2">二年级</SelectItem>
                      <SelectItem value="grade3">三年级</SelectItem>
                      <SelectItem value="grade4">四年级</SelectItem>
                      <SelectItem value="grade5">五年级</SelectItem>
                      <SelectItem value="grade6">六年级</SelectItem>
                      <SelectItem value="grade7">初一</SelectItem>
                      <SelectItem value="grade8">初二</SelectItem>
                      <SelectItem value="grade9">初三</SelectItem>
                      <SelectItem value="grade10">高一</SelectItem>
                      <SelectItem value="grade11">高二</SelectItem>
                      <SelectItem value="grade12">高三</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.grade && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{errors.grade}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialPoints">初始积分</Label>
              <Input
                id="initialPoints"
                type="number"
                min="0"
                value={initialPoints}
                onChange={(e) => setInitialPoints(e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
                placeholder="初始积分"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600">
              添加孩子
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

