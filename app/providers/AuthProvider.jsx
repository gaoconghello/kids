"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// 定义不需要验证的路由
const PUBLIC_ROUTES = ["/login", "/"];

// 创建认证上下文
const AuthContext = createContext({
  isAuthenticated: false,
  userInfo: null,
  logout: () => {},
});

// 导出 useAuth hook
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 登出函数
  const logout = async () => {
    // try {
    //   // 调用登出 API
    //   await fetch("/api/logout", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    // } catch (error) {
    //   console.error("登出 API 调用失败:", error);
    // }

    // 清除本地存储
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setIsAuthenticated(false);
    setUserInfo(null);
    
    // 使用 window.location.href 替代 router.push，强制页面完全刷新
    window.location.href = "/login";
  };

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUserInfo = localStorage.getItem("userInfo");
      
      if (token) {
        try {
          const userData = storedUserInfo ? JSON.parse(storedUserInfo) : null;
          setIsAuthenticated(true);
          setUserInfo(userData);
        } catch (error) {
          console.error("解析用户信息失败:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // 路径变化时检查权限
  useEffect(() => {
    if (isLoading) return;
    
    // 简化的路由控制：只检查是否有 token
    const token = localStorage.getItem("token");
    
    // 如果在登录页面，确保状态是未认证的
    if (pathname === "/login") {
      if (token) {
        // 如果有 token 但在登录页，可能是从 logout 跳转来的
        // 不做任何跳转，让用户可以重新登录
        return;
      }
    } else if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      // 没有 token 且不在公共路由，跳转到登录页
      router.push("/login");
    }
  }, [pathname, isLoading, router]);

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
      value={{ isAuthenticated, userInfo, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
