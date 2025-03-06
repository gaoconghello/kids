"use client"

import { useState } from "react"
import { X, Home, User, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function AddFamilyDialog({ isOpen, onClose, onAdd }) {
  const [familyName, setFamilyName] = useState("")
  const [parents, setParents] = useState([{ name: "", avatar: "/placeholder.svg?height=40&width=40" }])
  const [children, setChildren] = useState([
    { name: "", age: "", avatar: "/placeholder.svg?height=40&width=40", points: 0 },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!familyName.trim()) {
      alert("请输入家庭名称")
      return
    }

    if (parents.some((parent) => !parent.name.trim())) {
      alert("请填写所有家长的姓名")
      return
    }

    if (children.some((child) => !child.name.trim() || !child.age)) {
      alert("请填写所有孩子的姓名和年龄")
      return
    }

    // Create new family object
    const newFamily = {
      id: Date.now(),
      name: familyName,
      parents: parents.map((parent, index) => ({
        id: Date.now() + index + 1,
        name: parent.name,
        avatar: parent.avatar,
      })),
      children: children.map((child, index) => ({
        id: Date.now() + parents.length + index + 1,
        name: child.name,
        age: Number.parseInt(child.age) || 0,
        avatar: child.avatar,
        points: Number.parseInt(child.points) || 0,
      })),
      createdAt: new Date().toISOString().split("T")[0],
    }

    // Add the new family
    onAdd(newFamily)

    // Reset form
    setFamilyName("")
    setParents([{ name: "", avatar: "/placeholder.svg?height=40&width=40" }])
    setChildren([{ name: "", age: "", avatar: "/placeholder.svg?height=40&width=40", points: 0 }])

    // Close dialog
    onClose()
  }

  const addParent = () => {
    setParents([...parents, { name: "", avatar: "/placeholder.svg?height=40&width=40" }])
  }

  const removeParent = (index) => {
    if (parents.length > 1) {
      setParents(parents.filter((_, i) => i !== index))
    }
  }

  const updateParent = (index, field, value) => {
    const updatedParents = [...parents]
    updatedParents[index] = { ...updatedParents[index], [field]: value }
    setParents(updatedParents)
  }

  const addChild = () => {
    setChildren([...children, { name: "", age: "", avatar: "/placeholder.svg?height=40&width=40", points: 0 }])
  }

  const removeChild = (index) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  const updateChild = (index, field, value) => {
    const updatedChildren = [...children]
    updatedChildren[index] = { ...updatedChildren[index], [field]: value }
    setChildren(updatedChildren)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="relative w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">添加新家庭</h2>
            <p className="text-sm text-muted-foreground">创建一个新的家庭并添加家庭成员</p>
          </div>

          <div className="space-y-6">
            {/* 家庭名称 */}
            <div className="space-y-2">
              <Label htmlFor="familyName">家庭名称</Label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="h-10 sm:h-12 pl-10 text-sm sm:text-base"
                  placeholder="例如：张家"
                  required
                />
              </div>
            </div>

            {/* 家长信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">家长信息</Label>
                <Button type="button" variant="outline" size="sm" onClick={addParent}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加家长
                </Button>
              </div>

              {parents.map((parent, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center">
                      <User className="mr-1 h-4 w-4 text-blue-500" />
                      家长 {index + 1}
                    </h4>
                    {parents.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500"
                        onClick={() => removeParent(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor={`parentName-${index}`}>姓名</Label>
                      <Input
                        id={`parentName-${index}`}
                        value={parent.name}
                        onChange={(e) => updateParent(index, "name", e.target.value)}
                        className="h-9"
                        placeholder="请输入家长姓名"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 孩子信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">孩子信息</Label>
                <Button type="button" variant="outline" size="sm" onClick={addChild}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加孩子
                </Button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center">
                      <Users className="mr-1 h-4 w-4 text-purple-500" />
                      孩子 {index + 1}
                    </h4>
                    {children.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500"
                        onClick={() => removeChild(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`childName-${index}`}>姓名</Label>
                      <Input
                        id={`childName-${index}`}
                        value={child.name}
                        onChange={(e) => updateChild(index, "name", e.target.value)}
                        className="h-9"
                        placeholder="请输入孩子姓名"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`childAge-${index}`}>年龄</Label>
                      <Input
                        id={`childAge-${index}`}
                        type="number"
                        min="1"
                        max="18"
                        value={child.age}
                        onChange={(e) => updateChild(index, "age", e.target.value)}
                        className="h-9"
                        placeholder="请输入年龄"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`childPoints-${index}`}>初始积分</Label>
                      <Input
                        id={`childPoints-${index}`}
                        type="number"
                        min="0"
                        value={child.points}
                        onChange={(e) => updateChild(index, "points", e.target.value)}
                        className="h-9"
                        placeholder="初始积分"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600">
              创建家庭
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

