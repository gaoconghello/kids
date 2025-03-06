"use client"

import { useState } from "react"
import {
  User,
  Users,
  Home,
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import React from "react"
import { AddParentDialog } from "./add-parent-dialog"
import { EditParentDialog } from "./edit-parent-dialog"
import { DeleteParentDialog } from "./delete-parent-dialog"
// 在文件顶部导入新组件
import { AddChildDialog } from "./add-child-dialog"
import { EditChildDialog } from "./edit-child-dialog"
import { DeleteChildDialog } from "./delete-child-dialog"

export function AddFamilyDialog({ isOpen, onClose, onAdd }) {
  const [familyName, setFamilyName] = useState("")

  const handleSubmit = () => {
    const newFamily = {
      id: Date.now(), // 临时ID
      name: familyName,
      parents: [],
      children: [],
      createdAt: new Date().toLocaleDateString(),
    }
    onAdd(newFamily)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新家庭</DialogTitle>
          <DialogDescription>在此处填写新家庭的信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              家庭名称
            </Label>
            <Input
              id="name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" onClick={handleSubmit}>
            添加家庭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EditFamilyDialog({ isOpen, onClose, onEdit, family }) {
  const [familyName, setFamilyName] = useState(family?.name || "")

  // 当family属性变化时更新状态
  React.useEffect(() => {
    if (family) {
      setFamilyName(family.name)
    }
  }, [family])

  const handleSubmit = () => {
    if (!family) return

    const updatedFamily = {
      ...family,
      name: familyName,
    }
    onEdit(updatedFamily)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑家庭</DialogTitle>
          <DialogDescription>修改家庭信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              家庭名称
            </Label>
            <Input
              id="edit-name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" onClick={handleSubmit}>
            保存修改
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteFamilyDialog({ isOpen, onClose, onDelete, family }) {
  const handleDelete = () => {
    if (!family) return
    onDelete(family.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">删除家庭</DialogTitle>
          <DialogDescription>
            您确定要删除"{family?.name}"吗？此操作无法撤销，将删除该家庭的所有数据。
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            确认删除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminDashboard() {
  // 示例家庭数据
  const [families, setFamilies] = useState([
    {
      id: 1,
      name: "张家",
      parents: [
        { id: 1, name: "张爸爸", avatar: "/placeholder.svg?height=40&width=40" },
        { id: 2, name: "张妈妈", avatar: "/placeholder.svg?height=40&width=40" },
      ],
      children: [
        { id: 1, name: "张小明", age: 8, avatar: "/placeholder.svg?height=40&width=40", points: 350 },
        { id: 2, name: "张小红", age: 6, avatar: "/placeholder.svg?height=40&width=40", points: 280 },
      ],
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      name: "李家",
      parents: [{ id: 3, name: "李爸爸", avatar: "/placeholder.svg?height=40&width=40" }],
      children: [{ id: 3, name: "李小华", age: 9, avatar: "/placeholder.svg?height=40&width=40", points: 420 }],
      createdAt: "2025-02-01",
    },
    {
      id: 3,
      name: "王家",
      parents: [
        { id: 4, name: "王爸爸", avatar: "/placeholder.svg?height=40&width=40" },
        { id: 5, name: "王妈妈", avatar: "/placeholder.svg?height=40&width=40" },
      ],
      children: [
        { id: 4, name: "王小军", age: 7, avatar: "/placeholder.svg?height=40&width=40", points: 310 },
        { id: 5, name: "王小丽", age: 5, avatar: "/placeholder.svg?height=40&width=40", points: 150 },
        { id: 6, name: "王小刚", age: 10, avatar: "/placeholder.svg?height=40&width=40", points: 520 },
      ],
      createdAt: "2025-02-10",
    },
    {
      id: 4,
      name: "陈家",
      parents: [
        { id: 6, name: "陈爸爸", avatar: "/placeholder.svg?height=40&width=40" },
        { id: 7, name: "陈妈妈", avatar: "/placeholder.svg?height=40&width=40" },
      ],
      children: [{ id: 7, name: "陈小玲", age: 8, avatar: "/placeholder.svg?height=40&width=40", points: 380 }],
      createdAt: "2025-02-20",
    },
    {
      id: 5,
      name: "刘家",
      parents: [{ id: 8, name: "刘爸爸", avatar: "/placeholder.svg?height=40&width=40" }],
      children: [
        { id: 8, name: "刘小阳", age: 9, avatar: "/placeholder.svg?height=40&width=40", points: 400 },
        { id: 9, name: "刘小月", age: 7, avatar: "/placeholder.svg?height=40&width=40", points: 290 },
      ],
      createdAt: "2025-03-01",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFamilies, setExpandedFamilies] = useState({})
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false)
  const [isEditFamilyOpen, setIsEditFamilyOpen] = useState(false)
  const [editingFamily, setEditingFamily] = useState(null)
  const [isDeleteFamilyOpen, setIsDeleteFamilyOpen] = useState(false)
  const [deletingFamily, setDeletingFamily] = useState(null)
  const [isAddParentOpen, setIsAddParentOpen] = useState(false)
  const [addingParentToFamily, setAddingParentToFamily] = useState(null)
  const [isEditParentOpen, setIsEditParentOpen] = useState(false)
  const [editingParent, setEditingParent] = useState(null)
  const [isDeleteParentOpen, setIsDeleteParentOpen] = useState(false)
  const [deletingParent, setDeletingParent] = useState(null)
  // 在 AdminDashboard 组件中添加新的状态变量
  // 在 const [deletingParent, setDeletingParent] = useState(null) 后添加：
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)
  const [addingChildToFamily, setAddingChildToFamily] = useState(null)
  const [isEditChildOpen, setIsEditChildOpen] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [isDeleteChildOpen, setIsDeleteChildOpen] = useState(false)
  const [deletingChild, setDeletingChild] = useState(null)

  // 搜索过滤
  const filteredFamilies = families.filter(
    (family) =>
      family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.parents.some((parent) => parent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      family.children.some((child) => child.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // 切换家庭展开/折叠状态
  const toggleFamilyExpanded = (familyId) => {
    setExpandedFamilies((prev) => ({
      ...prev,
      [familyId]: !prev[familyId],
    }))
  }

  const handleAddFamily = (newFamily) => {
    setFamilies([...families, newFamily])
  }

  const handleEditFamily = (updatedFamily) => {
    setFamilies(families.map((family) => (family.id === updatedFamily.id ? updatedFamily : family)))
  }

  const handleDeleteFamily = (familyId) => {
    setFamilies(families.filter((family) => family.id !== familyId))
  }

  const handleAddParent = (newParent) => {
    setFamilies(
      families.map((family) => {
        if (family.id === newParent.familyId) {
          return {
            ...family,
            parents: [...family.parents, newParent],
          }
        }
        return family
      }),
    )
  }

  const handleEditParent = (updatedParent) => {
    setFamilies(
      families.map((family) => {
        if (family.id === updatedParent.familyId) {
          return {
            ...family,
            parents: family.parents.map((parent) => (parent.id === updatedParent.id ? updatedParent : parent)),
          }
        }
        return family
      }),
    )
  }

  const handleDeleteParent = (parentToDelete) => {
    setFamilies(
      families.map((family) => {
        if (family.id === parentToDelete.familyId) {
          return {
            ...family,
            parents: family.parents.filter((parent) => parent.id !== parentToDelete.id),
          }
        }
        return family
      }),
    )
  }

  // 添加处理孩子的函数
  // 在 handleDeleteParent 函数后添加：
  const handleAddChild = (newChild) => {
    setFamilies(
      families.map((family) => {
        if (family.id === newChild.familyId) {
          return {
            ...family,
            children: [...family.children, newChild],
          }
        }
        return family
      }),
    )
  }

  const handleEditChild = (updatedChild) => {
    setFamilies(
      families.map((family) => {
        if (family.id === updatedChild.familyId) {
          return {
            ...family,
            children: family.children.map((child) => (child.id === updatedChild.id ? updatedChild : child)),
          }
        }
        return family
      }),
    )
  }

  const handleDeleteChild = (childToDelete) => {
    setFamilies(
      families.map((family) => {
        if (family.id === childToDelete.familyId) {
          return {
            ...family,
            children: family.children.filter((child) => child.id !== childToDelete.id),
          }
        }
        return family
      }),
    )
  }

  // 添加打开编辑对话框的函数
  const openEditFamilyDialog = (family) => {
    setEditingFamily(family)
    setIsEditFamilyOpen(true)
  }

  // 添加打开删除对话框的函数
  const openDeleteFamilyDialog = (family) => {
    setDeletingFamily(family)
    setIsDeleteFamilyOpen(true)
  }

  const openAddParentDialog = (family) => {
    setAddingParentToFamily(family)
    setIsAddParentOpen(true)
  }

  const openEditParentDialog = (parent, familyId) => {
    setEditingParent({ ...parent, familyId })
    setIsEditParentOpen(true)
  }

  const openDeleteParentDialog = (parent, familyId) => {
    setDeletingParent({ ...parent, familyId })
    setIsDeleteParentOpen(true)
  }

  // 添加打开对话框的函数
  // 在 openDeleteParentDialog 函数后添加：
  const openAddChildDialog = (family) => {
    setAddingChildToFamily(family)
    setIsAddChildOpen(true)
  }

  const openEditChildDialog = (child, familyId) => {
    setEditingChild({ ...child, familyId })
    setIsEditChildOpen(true)
  }

  const openDeleteChildDialog = (child, familyId) => {
    setDeletingChild({ ...child, familyId })
    setIsDeleteChildOpen(true)
  }

  // 计算统计数据
  const totalFamilies = families.length
  const totalParents = families.reduce((sum, family) => sum + family.parents.length, 0)
  const totalChildren = families.reduce((sum, family) => sum + family.children.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 rounded-2xl bg-white/90 backdrop-blur-sm p-3 sm:p-4 shadow-lg border-2 border-white/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse blur"></div>
              <Avatar className="relative h-12 w-12 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                  管理
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                系统管理员
              </h2>
              <p className="text-gray-600">欢迎使用管理员控制台</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20">
              <Users className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-blue-600">管理员模式</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">设置</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              onClick={() => (window.location.href = "/login")}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">退出登录</span>
            </Button>
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* 家庭数量卡片 */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-400/90 to-cyan-500/90 p-4 shadow-lg border-2 border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">家庭总数</p>
                  <h3 className="text-2xl font-bold text-white">{totalFamilies}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 家长数量卡片 */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-400/90 to-pink-500/90 p-4 shadow-lg border-2 border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">家长总数</p>
                  <h3 className="text-2xl font-bold text-white">{totalParents}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 孩子数量卡片 */}
          <div className="rounded-2xl bg-gradient-to-br from-yellow-400/90 to-amber-500/90 p-4 shadow-lg border-2 border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">孩子总数</p>
                  <h3 className="text-2xl font-bold text-white">{totalChildren}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="families" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-white/80 p-1 text-xs sm:text-sm md:text-lg shadow-xl">
            <TabsTrigger
              value="families"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                <span>家庭管理</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                <span>系统设置</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* 家庭管理标签页内容 */}
          <TabsContent value="families" className="space-y-4">
            <Card className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Home className="mr-2 h-6 w-6 text-primary" />
                    家庭列表
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索家庭或成员..."
                        className="pl-9 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      className="rounded-full bg-gradient-to-r from-primary to-purple-600"
                      size="sm"
                      onClick={() => setIsAddFamilyOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加家庭
                    </Button>
                  </div>
                </div>
                <CardDescription>管理系统中的所有家庭</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredFamilies.length > 0 ? (
                    filteredFamilies.map((family) => (
                      <div key={family.id} className="rounded-xl border-2 border-primary/10 overflow-hidden">
                        <div
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer"
                          onClick={() => toggleFamilyExpanded(family.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Home className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{family.name}</h3>
                              <p className="text-sm text-muted-foreground">创建于 {family.createdAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              {family.parents.length} 位家长
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                              {family.children.length} 位孩子
                            </Badge>
                            <Button variant="ghost" size="icon">
                              {expandedFamilies[family.id] ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {expandedFamilies[family.id] && (
                          <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* 家长列表 */}
                              <div className="rounded-lg border border-blue-100 p-4">
                                <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                                  <User className="h-5 w-5 mr-2" />
                                  家长
                                </h4>
                                <div className="space-y-3">
                                  {family.parents.map((parent) => (
                                    <div
                                      key={parent.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={parent.avatar} />
                                          <AvatarFallback>{parent.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{parent.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openEditParentDialog(parent, family.id)
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openDeleteParentDialog(parent, family.id)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openAddParentDialog(family)
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    添加家长
                                  </Button>
                                </div>
                              </div>

                              {/* 孩子列表 */}
                              {/* 孩子列表部分 */}
                              <div className="rounded-lg border border-purple-100 p-4">
                                <h4 className="font-medium text-purple-700 mb-3 flex items-center">
                                  <Users className="h-5 w-5 mr-2" />
                                  孩子
                                </h4>
                                <div className="space-y-3">
                                  {family.children.map((child) => (
                                    <div
                                      key={child.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={child.avatar} />
                                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span>{child.name}</span>
                                            <span className="text-xs text-gray-500">{child.age}岁</span>
                                            <span className="text-xs text-gray-500">
                                              {child.gender === "male" ? "男" : "女"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {child.grade === "preschool"
                                                ? "幼儿园"
                                                : child.grade === "grade1"
                                                  ? "一年级"
                                                  : child.grade === "grade2"
                                                    ? "二年级"
                                                    : child.grade === "grade3"
                                                      ? "三年级"
                                                      : child.grade === "grade4"
                                                        ? "四年级"
                                                        : child.grade === "grade5"
                                                          ? "五年级"
                                                          : child.grade === "grade6"
                                                            ? "六年级"
                                                            : child.grade === "grade7"
                                                              ? "初一"
                                                              : child.grade === "grade8"
                                                                ? "初二"
                                                                : child.grade === "grade9"
                                                                  ? "初三"
                                                                  : child.grade === "grade10"
                                                                    ? "高一"
                                                                    : child.grade === "grade11"
                                                                      ? "高二"
                                                                      : child.grade === "grade12"
                                                                        ? "高三"
                                                                        : ""}
                                            </span>
                                          </div>
                                          <div className="text-xs text-amber-600 flex items-center">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-3 w-3 mr-1"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                            >
                                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                            {child.points} 积分
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openEditChildDialog(child, family.id)
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openDeleteChildDialog(child, family.id)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openAddChildDialog(family)
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    添加孩子
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end mt-4 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditFamilyDialog(family)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                编辑家庭
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openDeleteFamilyDialog(family)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除家庭
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">未找到家庭</h3>
                      <p className="mt-2 text-sm text-gray-500">没有找到符合搜索条件的家庭，请尝试其他搜索词。</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-6">
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm text-muted-foreground">共 {filteredFamilies.length} 个家庭</div>
                  <Button variant="outline" size="sm">
                    导出数据
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 系统设置标签页内容 */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                <CardTitle className="flex items-center text-2xl">
                  <Settings className="mr-2 h-6 w-6 text-primary" />
                  系统设置
                </CardTitle>
                <CardDescription>管理系统设置</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">系统设置功能开发中</h3>
                  <p className="mt-2 text-sm text-gray-500">此功能正在开发中，敬请期待。</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* 添加家庭对话框 */}
        <AddFamilyDialog isOpen={isAddFamilyOpen} onClose={() => setIsAddFamilyOpen(false)} onAdd={handleAddFamily} />
        <EditFamilyDialog
          isOpen={isEditFamilyOpen}
          onClose={() => {
            setIsEditFamilyOpen(false)
            setEditingFamily(null)
          }}
          onEdit={handleEditFamily}
          family={editingFamily}
        />
        <DeleteFamilyDialog
          isOpen={isDeleteFamilyOpen}
          onClose={() => {
            setIsDeleteFamilyOpen(false)
            setDeletingFamily(null)
          }}
          onDelete={handleDeleteFamily}
          family={deletingFamily}
        />
        <AddParentDialog
          isOpen={isAddParentOpen}
          onClose={() => {
            setIsAddParentOpen(false)
            setAddingParentToFamily(null)
          }}
          onAdd={handleAddParent}
          familyId={addingParentToFamily?.id}
        />
        <EditParentDialog
          isOpen={isEditParentOpen}
          onClose={() => {
            setIsEditParentOpen(false)
            setEditingParent(null)
          }}
          onEdit={handleEditParent}
          parent={editingParent}
        />
        <DeleteParentDialog
          isOpen={isDeleteParentOpen}
          onClose={() => {
            setIsDeleteParentOpen(false)
            setDeletingParent(null)
          }}
          onDelete={handleDeleteParent}
          parent={deletingParent}
        />
        {/* 在组件末尾添加新的对话框组件 */}
        {/* 在 <DeleteParentDialog /> 后添加： */}
        <AddChildDialog
          isOpen={isAddChildOpen}
          onClose={() => {
            setIsAddChildOpen(false)
            setAddingChildToFamily(null)
          }}
          onAdd={handleAddChild}
          familyId={addingChildToFamily?.id}
        />
        <EditChildDialog
          isOpen={isEditChildOpen}
          onClose={() => {
            setIsEditChildOpen(false)
            setEditingChild(null)
          }}
          onEdit={handleEditChild}
          child={editingChild}
        />
        <DeleteChildDialog
          isOpen={isDeleteChildOpen}
          onClose={() => {
            setIsDeleteChildOpen(false)
            setDeletingChild(null)
          }}
          onDelete={handleDeleteChild}
          child={deletingChild}
        />
      </div>
    </div>
  )
}

