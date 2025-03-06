"use client"

import { useState, useEffect } from "react"
import { X, Award, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 修改组件参数，添加 childrenList 参数
export function AddTaskDialog({ isOpen, onClose, onAdd, initialData, childrenList = [] }) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [points, setPoints] = useState(initialData?.points?.toString() || "")
  // 添加 childName 状态
  const [childName, setChildName] = useState(
    initialData?.childName || (childrenList.length > 0 ? childrenList[0].name : ""),
  )

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "")
      setPoints(initialData.points?.toString() || "")
      setChildName(initialData.childName || "")
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      title,
      points: Number.parseInt(points),
      completed: false,
      time: "今天",
      childName, // 添加 childName 到提交的数据中
    })
    // Reset form
    setTitle("")
    setPoints("")
    setChildName(childrenList.length > 0 ? childrenList[0].name : "")
    onClose()
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
            <h2 className="text-2xl font-bold text-primary">{initialData ? "修改任务" : "添加新任务"}</h2>
            <p className="text-sm text-muted-foreground">{initialData ? "修改任务内容" : "记录今天要完成的任务吧！"}</p>
          </div>

          <div className="space-y-4">
            {/* 添加选择小朋友的下拉菜单 */}
            {childrenList.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="childName">选择小朋友</Label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <Select value={childName} onValueChange={setChildName}>
                    <SelectTrigger className="h-10 pl-10 text-sm sm:h-12 sm:text-base">
                      <SelectValue placeholder="选择小朋友" />
                    </SelectTrigger>
                    <SelectContent>
                      {childrenList.map((child) => (
                        <SelectItem key={child.id} value={child.name}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">任务内容</Label>
              <div className="relative">
                <BookOpen className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 pl-10 text-sm sm:h-12 sm:text-base"
                  placeholder="例如：整理书桌"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">完成可获得积分</Label>
              <div className="relative">
                <Award className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="h-10 pl-10 text-sm sm:h-12 sm:text-base"
                  placeholder="15"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600">
              {initialData ? "保存修改" : "添加任务"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

