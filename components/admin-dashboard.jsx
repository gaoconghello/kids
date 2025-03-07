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
import { useAuth } from "@/app/providers/AuthProvider"
import { toast } from "sonner"
import { get, post, put, del } from "@/lib/http"

export function AddFamilyDialog({ isOpen, onClose, onAdd }) {
  const [familyName, setFamilyName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!familyName.trim()) {
      toast.error("家庭名称不能为空");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 调用API创建新家庭
      const response = await post('/api/family', { name: familyName });
      const result = await response.json();
      
      if (result.code === 200) {
        // 成功创建家庭
        toast.success("家庭创建成功");
        onAdd(result.data);
        setFamilyName(""); // 清空输入
        onClose();
      } else {
        // API返回错误
        toast.error(result.message || "创建家庭失败");
      }
    } catch (error) {
      console.error("创建家庭出错:", error);
      toast.error("创建家庭时发生错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新家庭</DialogTitle>
          <DialogDescription>在此处填写新家庭的信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
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
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "添加中..." : "添加家庭"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EditFamilyDialog({ isOpen, onClose, onEdit, family }) {
  const [familyName, setFamilyName] = useState(family?.name || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 当family属性变化时更新状态
  React.useEffect(() => {
    if (family) {
      setFamilyName(family.name)
    }
  }, [family])

  const handleSubmit = async () => {
    if (!family) return
    
    if (!familyName.trim()) {
      toast.error("家庭名称不能为空");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 调用API更新家庭信息
      const response = await put('/api/family', { 
        id: family.id, 
        name: familyName 
      });
      const result = await response.json();
      
      if (result.code === 200) {
        // 成功更新家庭
        toast.success("家庭信息更新成功");
        onEdit(result.data);
        onClose();
      } else {
        // API返回错误
        toast.error(result.message || "更新家庭失败");
      }
    } catch (error) {
      console.error("更新家庭出错:", error);
      toast.error("更新家庭时发生错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑家庭</DialogTitle>
          <DialogDescription>修改家庭信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
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
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中..." : "保存修改"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteFamilyDialog({ isOpen, onClose, onDelete, family }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!family) return
    
    try {
      setIsDeleting(true);
      
      // 调用API删除家庭
      const response = await del(`/api/family?id=${family.id}`);
      const result = await response.json();
      
      if (result.code === 200) {
        // 成功删除家庭
        toast.success("家庭已成功删除");
        onDelete(family.id);
        onClose();
      } else {
        // API返回错误
        toast.error(result.message || "删除家庭失败");
      }
    } catch (error) {
      console.error("删除家庭出错:", error);
      toast.error("删除家庭时发生错误");
    } finally {
      setIsDeleting(false);
    }
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
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "删除中..." : "确认删除"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminDashboard() {
  const { logout } = useAuth()
  // 修改为使用API获取家庭数据
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 添加useEffect钩子来获取家庭数据
  React.useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true)
        const response = await get('/api/family')
        const result = await response.json()
        
        if (result.code === 200) {
          setFamilies(result.data)
        } else {
          setError(result.message || '获取家庭数据失败')
        }
      } catch (err) {
        console.error('获取家庭数据出错:', err)
        setError('获取家庭数据时发生错误')
      } finally {
        setLoading(false)
      }
    }

    fetchFamilies()
  }, [])

  // 添加重新获取数据的函数
  const handleRefreshData = async () => {
    try {
      // 只设置局部加载状态
      setError(null)
      const response = await get('/api/family')
      const result = await response.json()
      
      if (result.code === 200) {
        setFamilies(result.data)
        toast.success('数据已成功刷新')
      } else {
        setError(result.message || '获取家庭数据失败')
        toast.error(result.message || '获取家庭数据失败')
      }
    } catch (err) {
      console.error('获取家庭数据出错:', err)
      setError('获取家庭数据时发生错误')
      toast.error('获取家庭数据时发生错误')
    }
  }

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

  const handleAddFamily = async (newFamily) => {
    // 添加新家庭到状态
    setFamilies([...families, newFamily])
    
    // 刷新数据以确保与服务器同步
    await handleRefreshData()
  }

  const handleEditFamily = async (updatedFamily) => {
    // 更新家庭信息
    setFamilies(families.map((family) => (family.id === updatedFamily.id ? updatedFamily : family)))
    
    // 刷新数据以确保与服务器同步
    await handleRefreshData()
  }

  const handleDeleteFamily = async (familyId) => {
    // 从状态中移除家庭
    setFamilies(families.filter((family) => family.id !== familyId))
    
    // 刷新数据以确保与服务器同步
    await handleRefreshData()
  }

  const handleAddParent = (newParent) => {
    // 更新本地状态
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
    // 更新本地状态
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
    // 更新本地状态
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
  const totalFamilies = loading ? 0 : families.length
  const totalParents = loading ? 0 : families.reduce((sum, family) => sum + family.parents.length, 0)
  const totalChildren = loading ? 0 : families.reduce((sum, family) => sum + family.children.length, 0)

  return (
    <div className="min-h-screen p-3 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-3 p-3 mb-4 border-2 shadow-lg sm:mb-6 sm:flex-row sm:items-center sm:gap-0 rounded-2xl bg-white/90 backdrop-blur-sm sm:p-4 border-white/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse blur"></div>
              <Avatar className="relative w-12 h-12 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="text-white bg-gradient-to-r from-blue-400 to-purple-400">
                  管理
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                系统管理员
              </h2>
              <p className="text-gray-600">欢迎使用管理员控制台</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 border-blue-400/20">
              <Users className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-blue-600">管理员模式</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors rounded-full hover:bg-blue-100 hover:text-blue-600"
            >
              <Settings className="w-5 h-5" />
              <span className="sr-only">设置</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors rounded-full hover:bg-red-100 hover:text-red-600"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span className="sr-only">退出登录</span>
            </Button>
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-3 sm:gap-4 sm:mb-6">
          {/* 家庭数量卡片 */}
          <div className="p-4 border-2 shadow-lg rounded-2xl bg-gradient-to-br from-blue-400/90 to-cyan-500/90 border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">家庭总数</p>
                  <h3 className="text-2xl font-bold text-white">{totalFamilies}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 家长数量卡片 */}
          <div className="p-4 border-2 shadow-lg rounded-2xl bg-gradient-to-br from-purple-400/90 to-pink-500/90 border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">家长总数</p>
                  <h3 className="text-2xl font-bold text-white">{totalParents}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 孩子数量卡片 */}
          <div className="p-4 border-2 shadow-lg rounded-2xl bg-gradient-to-br from-yellow-400/90 to-amber-500/90 border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
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
          <TabsList className="grid w-full grid-cols-2 p-1 text-xs shadow-xl rounded-xl bg-white/80 sm:text-sm md:text-lg">
            <TabsTrigger
              value="families"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                <span>家庭管理</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                <span>系统设置</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* 家庭管理标签页内容 */}
          <TabsContent value="families" className="space-y-4">
            <Card className="overflow-hidden bg-white border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Home className="w-6 h-6 mr-2 text-primary" />
                    家庭列表
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                      <Input
                        placeholder="搜索家庭或成员..."
                        className="w-full pl-9 sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      className="rounded-full bg-gradient-to-r from-primary to-purple-600"
                      size="sm"
                      onClick={() => setIsAddFamilyOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加家庭
                    </Button>
                  </div>
                </div>
                <CardDescription>管理系统中的所有家庭</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    // 加载状态UI
                    <div className="p-8 text-center border border-gray-300 border-dashed rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full animate-pulse">
                        <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">正在加载家庭数据</h3>
                      <p className="mt-2 text-sm text-gray-500">请稍候，正在从服务器获取数据...</p>
                    </div>
                  ) : error ? (
                    // 错误状态UI
                    <div className="p-8 text-center border border-red-300 border-dashed rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                        <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-red-900">获取数据失败</h3>
                      <p className="mt-2 text-sm text-red-500">{error}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={handleRefreshData}
                      >
                        重新加载
                      </Button>
                    </div>
                  ) : filteredFamilies.length > 0 ? (
                    filteredFamilies.map((family) => (
                      <div key={family.id} className="overflow-hidden border-2 rounded-xl border-primary/10">
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50"
                          onClick={() => toggleFamilyExpanded(family.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              <Home className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{family.name}</h3>
                              <p className="text-sm text-muted-foreground">创建于 {family.createdAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                              {family.parents.length} 位家长
                            </Badge>
                            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                              {family.children.length} 位孩子
                            </Badge>
                            <Button variant="ghost" size="icon">
                              {expandedFamilies[family.id] ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {expandedFamilies[family.id] && (
                          <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* 家长列表 */}
                              <div className="p-4 border border-blue-100 rounded-lg">
                                <h4 className="flex items-center mb-3 font-medium text-blue-700">
                                  <User className="w-5 h-5 mr-2" />
                                  家长
                                </h4>
                                <div className="space-y-3">
                                  {family.parents.map((parent) => (
                                    <div
                                      key={parent.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={parent.avatar} />
                                          <AvatarFallback>{parent.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{parent.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="w-8 h-8"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openEditParentDialog(parent, family.id)
                                          }}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="w-8 h-8 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openDeleteParentDialog(parent, family.id)
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
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
                                    <Plus className="w-4 h-4 mr-2" />
                                    添加家长
                                  </Button>
                                </div>
                              </div>

                              {/* 孩子列表 */}
                              {/* 孩子列表部分 */}
                              <div className="p-4 border border-purple-100 rounded-lg">
                                <h4 className="flex items-center mb-3 font-medium text-purple-700">
                                  <Users className="w-5 h-5 mr-2" />
                                  孩子
                                </h4>
                                <div className="space-y-3">
                                  {family.children.map((child) => (
                                    <div
                                      key={child.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
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
                                          <div className="flex items-center text-xs text-amber-600">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-3 h-3 mr-1"
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
                                          className="w-8 h-8"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openEditChildDialog(child, family.id)
                                          }}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="w-8 h-8 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openDeleteChildDialog(child, family.id)
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
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
                                    <Plus className="w-4 h-4 mr-2" />
                                    添加孩子
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditFamilyDialog(family)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
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
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除家庭
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center border border-gray-300 border-dashed rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">未找到家庭</h3>
                      <p className="mt-2 text-sm text-gray-500">没有找到符合搜索条件的家庭，请尝试其他搜索词。</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-gray-50">
                <div className="flex items-center justify-between w-full">
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
            <Card className="overflow-hidden bg-white border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                <CardTitle className="flex items-center text-2xl">
                  <Settings className="w-6 h-6 mr-2 text-primary" />
                  系统设置
                </CardTitle>
                <CardDescription>管理系统设置</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-8 text-center border border-gray-300 border-dashed rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                    <Settings className="w-6 h-6 text-gray-400" />
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

