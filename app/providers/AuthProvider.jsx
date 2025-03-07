"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

// 定义不需要验证的路由
const PUBLIC_ROUTES = ["/login", "/"];

// 创建认证上下文
const AuthContext = createContext({
  isAuthenticated: false,
  userInfo: null,
  logout: () => {},
  checkRouteAccess: () => true,
});

// 导出 useAuth hook
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // 添加一个标志，用于防止登出过程中的重定向冲突
  const isLoggingOut = useRef(false);

  // 登出函数
  const logout = async () => {
    // 设置登出标志
    isLoggingOut.current = true;
    
    try {
      // 调用登出 API
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("登出 API 调用失败:", error);
    }

    // 清除本地存储
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setIsAuthenticated(false);
    setUserInfo(null);
    router.push("/login");
    
    // 延迟重置登出标志，确保重定向完成
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 500);
  };

  // 检查用户是否有权限访问当前路由
  const checkRouteAccess = (path, userRole) => {
    // 如果是公共路由，允许访问
    if (PUBLIC_ROUTES.includes(path)) {
      return true;
    }
    // 简化的权限检查：只要登录了就可以访问非公共路由
    return !!userRole;
  };

  // 检查认证状态并处理路由重定向
  const handleAuthAndRouting = () => {
    const token = localStorage.getItem("token");
    const storedUserInfo = localStorage.getItem("userInfo");
    
    let isAuth = false;
    let userData = null;

    if (token && storedUserInfo) {
      try {
        userData = JSON.parse(storedUserInfo);
        isAuth = true;
      } catch (error) {
        console.error("解析用户信息失败:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
      }
    }

    // 更新状态
    setIsAuthenticated(isAuth);
    setUserInfo(userData);
    setIsLoading(false);

    // 处理路由重定向
    if (isAuth) {
      // 已登录用户，如果在登录页或首页，重定向到仪表盘
      if (PUBLIC_ROUTES.includes(pathname)) {
        router.push("/dashboard");
      }
    } else {
      // 未登录用户，如果不是公共路由，重定向到登录页
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push("/login");
      }
    }

    return { isAuth, userData };
  };

  // 初始化时检查认证状态
  useEffect(() => {
    handleAuthAndRouting();
  }, []);

  // 路径变化时检查权限
  useEffect(() => {
    // 如果正在加载或正在登出，不进行重定向
    if (isLoading || isLoggingOut.current) return;
    
    // 检查当前路径是否需要重定向
    if (isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
      router.push("/dashboard");
    } else if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login");
    }
  }, [pathname, isAuthenticated, isLoading]);

  // 加载中状态显示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="text-center">
          <div className="flex justify-center mb-4 space-x-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
            <div
              className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold text-white">小朋友积分乐园</h2>
          <p className="mt-2 text-white">正在加载中...</p>
        </div>
      </div>
    );
  }

  // 提供认证上下文
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userInfo, logout, checkRouteAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
}
