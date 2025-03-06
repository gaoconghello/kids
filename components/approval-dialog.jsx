"use client"

import { X, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export function ApprovalDialog({ isOpen, onClose, onApprove, onReject, item, type, showWrongAnswersHelp = false }) {
  const [wrongAnswers, setWrongAnswers] = useState(0)

  if (!isOpen || !item) return null

  // 根据类型确定标题和内容
  let title = ""
  let content = ""
  let icon = null

  switch (type) {
    case "homework-add":
      title = "审批作业添加"
      content = `确认添加作业：${item.title}（${item.subject}）？`
      icon = <AlertCircle className="h-6 w-6 text-amber-500" />
      break
    case "homework-complete":
      title = "审批作业完成"
      content = `确认小朋友已完成作业：${item.title}（${item.subject}）？`
      icon = <CheckCircle2 className="h-6 w-6 text-green-500" />
      break
    case "task-add":
      title = "审批任务添加"
      content = `确认添加任务：${item.title}？`
      icon = <AlertCircle className="h-6 w-6 text-amber-500" />
      break
    case "task-complete":
      title = "审批任务完成"
      content = `确认小朋友已完成任务：${item.title}？`
      icon = <CheckCircle2 className="h-6 w-6 text-green-500" />
      break
    case "reward-redeem":
      title = "审批奖励兑换"
      content = `确认小朋友兑换奖励：${item.rewardTitle}？`
      icon = <AlertCircle className="h-6 w-6 text-amber-500" />
      break
    default:
      title = "审批"
      content = "确认此操作？"
      icon = <AlertCircle className="h-6 w-6 text-amber-500" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            {icon}
            <h2 className="text-xl sm:text-2xl font-bold text-primary">{title}</h2>
          </div>

          <div className="mb-6">
            <p className="text-base sm:text-lg text-gray-700">{content}</p>
            {item.points && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-gray-600">积分：</span>
                <Badge variant="outline" className="flex gap-1 border-yellow-300 bg-yellow-50">
                  <span className="font-bold text-yellow-600">{item.points}</span>
                </Badge>
              </div>
            )}
          </div>

          {type === "homework-complete" && (
            <div className="mt-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h4 className="font-medium text-amber-700">错题数量</h4>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={wrongAnswers}
                  onChange={(e) => setWrongAnswers(Number.parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              {showWrongAnswersHelp && (
                <div className="mt-2 text-sm text-gray-600 bg-amber-50 p-2 rounded-md border border-amber-100">
                  <p>请输入此次作业中的错题数量，这将帮助系统：</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>跟踪孩子的学习进度</li>
                    <li>分析薄弱知识点</li>
                    <li>生成针对性的学习建议</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onReject} className="border-red-200 text-red-600 hover:bg-red-50">
              <XCircle className="mr-2 h-4 w-4" />
              拒绝
            </Button>
            <Button onClick={() => onApprove(wrongAnswers)} className="bg-gradient-to-r from-green-500 to-teal-500">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              批准
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

