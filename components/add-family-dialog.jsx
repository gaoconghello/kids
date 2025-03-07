"use client"

import { useState } from "react"
import { X, Home, User, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

// 定义Zod验证模式
const parentSchema = z.object({
  name: z.string().min(1, "家长姓名不能为空").max(50, "家长姓名不能超过50个字符"),
  avatar: z.string().default("/placeholder.svg?height=40&width=40")
})

const childSchema = z.object({
  name: z.string().min(1, "孩子姓名不能为空").max(50, "孩子姓名不能超过50个字符"),
  age: z.string().refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 18;
  }, "年龄必须是1-18之间的数字"),
  avatar: z.string().default("/placeholder.svg?height=40&width=40"),
  points: z.string().transform(val => parseInt(val) || 0).default("0")
})

const familySchema = z.object({
  name: z.string().min(1, "家庭名称不能为空").max(50, "家庭名称不能超过50个字符"),
  parents: z.array(parentSchema).min(1, "至少需要一位家长"),
  children: z.array(childSchema).min(1, "至少需要一个孩子")
})

export function AddFamilyDialog({ isOpen, onClose, onAdd }) {
  const [parents, setParents] = useState([{ name: "", avatar: "/placeholder.svg?height=40&width=40" }])
  const [children, setChildren] = useState([
    { name: "", age: "", avatar: "/placeholder.svg?height=40&width=40", points: "0" },
  ])

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: "",
      parents: parents,
      children: children
    }
  })

  const onSubmit = (data) => {
    // 创建新家庭对象
    const newFamily = {
      id: Date.now(),
      name: data.name,
      parents: data.parents.map((parent, index) => ({
        id: Date.now() + index + 1,
        name: parent.name,
        avatar: parent.avatar,
      })),
      children: data.children.map((child, index) => ({
        id: Date.now() + data.parents.length + index + 1,
        name: child.name,
        age: Number.parseInt(child.age) || 0,
        avatar: child.avatar,
        points: Number.parseInt(child.points) || 0,
      })),
      createdAt: new Date().toISOString().split("T")[0],
    }

    // 添加新家庭
    onAdd(newFamily)

    // 重置表单
    reset()
    setParents([{ name: "", avatar: "/placeholder.svg?height=40&width=40" }])
    setChildren([{ name: "", age: "", avatar: "/placeholder.svg?height=40&width=40", points: "0" }])

    // 关闭对话框
    onClose()
  }

  const addParent = () => {
    const newParents = [...parents, { name: "", avatar: "/placeholder.svg?height=40&width=40" }]
    setParents(newParents)
    setValue("parents", newParents)
  }

  const removeParent = (index) => {
    if (parents.length > 1) {
      const newParents = parents.filter((_, i) => i !== index)
      setParents(newParents)
      setValue("parents", newParents)
    }
  }

  const updateParent = (index, field, value) => {
    const updatedParents = [...parents]
    updatedParents[index] = { ...updatedParents[index], [field]: value }
    setParents(updatedParents)
    setValue(`parents.${index}.${field}`, value)
  }

  const addChild = () => {
    const newChildren = [...children, { name: "", age: "", avatar: "/placeholder.svg?height=40&width=40", points: "0" }]
    setChildren(newChildren)
    setValue("children", newChildren)
  }

  const removeChild = (index) => {
    if (children.length > 1) {
      const newChildren = children.filter((_, i) => i !== index)
      setChildren(newChildren)
      setValue("children", newChildren)
    }
  }

  const updateChild = (index, field, value) => {
    const updatedChildren = [...children]
    updatedChildren[index] = { ...updatedChildren[index], [field]: value }
    setChildren(updatedChildren)
    setValue(`children.${index}.${field}`, value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50">
      <Card className="relative w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">添加新家庭</h2>
            <p className="text-sm text-muted-foreground">创建一个新的家庭并添加家庭成员</p>
          </div>

          <div className="space-y-6">
            {/* 家庭名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">家庭名称</Label>
              <div className="relative">
                <Home className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="name"
                  {...register("name")}
                  className="h-10 pl-10 text-sm sm:h-12 sm:text-base"
                  placeholder="例如：张家"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 家长信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">家长信息</Label>
                <Button type="button" variant="outline" size="sm" onClick={addParent}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加家长
                </Button>
              </div>
              
              {errors.parents && !Array.isArray(errors.parents) && (
                <p className="text-sm text-red-500">{errors.parents.message}</p>
              )}

              {parents.map((parent, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="flex items-center font-medium">
                      <User className="w-4 h-4 mr-1 text-blue-500" />
                      家长 {index + 1}
                    </h4>
                    {parents.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-0 text-red-500 h-7 w-7"
                        onClick={() => removeParent(index)}
                      >
                        <X className="w-4 h-4" />
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
                      />
                      {errors.parents && errors.parents[index]?.name && (
                        <p className="text-sm text-red-500">{errors.parents[index].name.message}</p>
                      )}
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
                  <Plus className="w-4 h-4 mr-1" />
                  添加孩子
                </Button>
              </div>
              
              {errors.children && !Array.isArray(errors.children) && (
                <p className="text-sm text-red-500">{errors.children.message}</p>
              )}

              {children.map((child, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="flex items-center font-medium">
                      <Users className="w-4 h-4 mr-1 text-purple-500" />
                      孩子 {index + 1}
                    </h4>
                    {children.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-0 text-red-500 h-7 w-7"
                        onClick={() => removeChild(index)}
                      >
                        <X className="w-4 h-4" />
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
                      />
                      {errors.children && errors.children[index]?.name && (
                        <p className="text-sm text-red-500">{errors.children[index].name.message}</p>
                      )}
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
                      />
                      {errors.children && errors.children[index]?.age && (
                        <p className="text-sm text-red-500">{errors.children[index].age.message}</p>
                      )}
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

          <div className="flex justify-end gap-3 mt-6">
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

