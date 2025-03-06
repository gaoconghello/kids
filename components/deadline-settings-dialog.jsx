"use client"

import { useState, useEffect } from "react"
import { X, Clock, AlertTriangle, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function DeadlineSettingsDialog({ isOpen, onClose, onSave, currentSettings }) {
  const [enabled, setEnabled] = useState(currentSettings?.enabled || false)
  const [time, setTime] = useState(currentSettings?.time || "20:00")
  const [bonusPoints, setBonusPoints] = useState(currentSettings?.bonusPoints?.toString() || "50")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (currentSettings) {
      setEnabled(currentSettings.enabled || false)
      setTime(currentSettings.time || "20:00")
      setBonusPoints(currentSettings.bonusPoints?.toString() || "50")
    }
  }, [currentSettings])

  const validateForm = () => {
    const newErrors = {}

    if (!time) newErrors.time = "请输入截止时间"
    if (!bonusPoints) newErrors.bonusPoints = "请输入奖励积分"
    if (isNaN(Number(bonusPoints)) || Number(bonusPoints) <= 0) {
      newErrors.bonusPoints = "请输入有效的积分数值"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const settings = {
      enabled,
      time,
      bonusPoints: Number(bonusPoints),
    }

    onSave(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">作业截止时间设置</h2>
            <p className="text-sm text-muted-foreground">设置小朋友完成作业的截止时间和奖励积分</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deadline-enabled" className="text-base">
                  启用截止时间
                </Label>
                <p className="text-sm text-muted-foreground">
                  开启后，小朋友需要在截止时间前完成所有作业才能获得额外奖励
                </p>
              </div>
              <Switch id="deadline-enabled" checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
              <div className="flex gap-2">
                <Info className="h-5 w-5 shrink-0" />
                <p>设置截止时间后，小朋友只有在该时间前完成所有作业，才能获得额外的奖励积分。</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline-time">截止时间</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="deadline-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.time ? "border-red-500" : ""}`}
                  disabled={!enabled}
                />
              </div>
              {errors.time && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.time}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-points">额外奖励积分</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="bonus-points"
                  type="number"
                  min="1"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${errors.bonusPoints ? "border-red-500" : ""}`}
                  placeholder="例如：50"
                  disabled={!enabled}
                />
              </div>
              {errors.bonusPoints && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.bonusPoints}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600">
              保存设置
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

