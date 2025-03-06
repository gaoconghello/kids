"use client"

import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DeleteChildDialog({ isOpen, onClose, onDelete, child }) {
  if (!isOpen || !child) return null

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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-600">删除孩子</h2>
              <p className="text-sm text-muted-foreground">此操作无法撤销</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-base text-gray-700">
              您确定要删除孩子 <span className="font-semibold">{child.name}</span> 吗？
            </p>
            <p className="mt-2 text-sm text-gray-500">删除后，该孩子将无法登录系统，所有相关数据将被移除。</p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(child)
                onClose()
              }}
            >
              确认删除
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

