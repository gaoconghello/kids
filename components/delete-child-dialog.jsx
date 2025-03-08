"use client"

import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DeleteChildDialog({ isOpen, onClose, onDelete, child }) {
  const handleDelete = () => {
    if (child) {
      onDelete(child)
      onClose()
    }
  }

  if (!isOpen || !child) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">删除孩子</h2>
            <p className="mt-1 text-sm text-center text-muted-foreground">
              此操作不可逆，请确认是否要删除该孩子账户
            </p>
          </div>

          <div className="p-4 mb-6 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-700">
              <span className="font-medium">姓名:</span> {child.name}
            </p>
            {child.age && (
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-medium">年龄:</span> {child.age}岁
              </p>
            )}
            <p className="mt-1 text-sm text-gray-700">
              <span className="font-medium">当前积分:</span> {child.points || 0}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              确认删除
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

