"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function DeleteParentDialog({ isOpen, onClose, onDelete, parent }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!parent) return

    setIsDeleting(true)

    try {
      // 调用API删除家长
      const response = await fetch(`/api/parent?id=${parent.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // 删除成功
        toast.success("家长删除成功")
        onDelete(parent)
        onClose()
      } else {
        // API返回错误
        toast.error(result.message || "删除家长失败")
      }
    } catch (error) {
      console.error("删除家长出错:", error)
      toast.error("删除家长时发生错误")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !parent) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-600">删除家长</h2>
              <p className="text-sm text-muted-foreground">此操作无法撤销</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-base text-gray-700">
              您确定要删除家长 <span className="font-semibold">{parent.name}</span> 吗？
            </p>
            <p className="mt-2 text-sm text-gray-500">删除后，该家长将无法登录系统，所有相关数据将被移除。</p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

