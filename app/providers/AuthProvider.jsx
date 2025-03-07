'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// 定义不需要验证的路由
const PUBLIC_ROUTES = ['/login']

// 创建认证上下文
const AuthContext = createContext({
  isAuthenticated: false,
  userInfo: null,
  logout: () => {}
})

// 导出 useAuth hook
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  // 登出函数
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setIsAuthenticated(false)
    setUserInfo(null)
    router.push('/login')
  }

  useEffect(() => {
    // 检查认证状态
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const storedUserInfo = localStorage.getItem('userInfo')

      if (token && storedUserInfo) {
        setIsAuthenticated(true)
        setUserInfo(JSON.parse(storedUserInfo))
      } else {
        setIsAuthenticated(false)
        setUserInfo(null)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // 路由保护
    const token = localStorage.getItem('token')
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    if (!token && !isPublicRoute) {
      router.push('/login')
    } else if (token && pathname === '/login') {
      router.push('/dashboard')
    }
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}