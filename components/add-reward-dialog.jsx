"use client"

import { useState } from "react"
import { X, Award, Gift, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function AddRewardDialog({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState("")
  const [points, setPoints] = useState("")
  const [image, setImage] = useState("/placeholder.svg?height=80&width=80")

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      title,
      points: Number.parseInt(points),
      image,
    })
    // Reset form
    setTitle("")
    setPoints("")
    setImage("/placeholder.svg?height=80&width=80")
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
            <h2 className="text-2xl font-bold text-primary">添加新奖励</h2>
            <p className="text-sm text-muted-foreground">添加小朋友可以兑换的奖励</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">奖励名称</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 sm:h-12 pl-10 text-sm sm:text-base"
                  placeholder="例如：看30分钟动画片"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">所需积分</Label>
              <div className="relative">
                <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="h-10 sm:h-12 pl-10 text-sm sm:text-base"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">奖励图片</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border border-gray-200">
                  <img src={image || "/placeholder.svg"} alt="奖励图片预览" className="h-full w-full object-cover" />
                </div>
                <Button type="button" variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  上传图片
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">（此功能仅为示例，实际上传功能需要后端支持）</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600">
              添加奖励
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

