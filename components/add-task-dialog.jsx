"use client"

import { useState, useEffect } from "react"
import { X, Award, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function AddTaskDialog({ isOpen, onClose, onAdd, initialData }) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [points, setPoints] = useState(initialData?.points?.toString() || "")

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "")
      setPoints(initialData.points?.toString() || "")
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      title,
      points: Number.parseInt(points),
      completed: false,
      time: "今天",
    })
    // Reset form
    setTitle("")
    setPoints("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-lg overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">{initialData ? "修改任务" : "添加新任务"}</h2>
            <p className="text-sm text-muted-foreground">{initialData ? "修改任务内容" : "记录今天要完成的任务吧！"}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">任务内容</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 sm:h-12 pl-10 text-sm sm:text-base"
                  placeholder="例如：整理书桌"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">完成可获得积分</Label>
              <div className="relative">
                <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="h-10 sm:h-12 pl-10 text-sm sm:text-base"
                  placeholder="15"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
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

