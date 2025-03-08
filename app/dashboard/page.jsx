"use client";

import { useAuth } from "../providers/AuthProvider";
import Dashboard from "@/components/dashboard";
import ParentDashboard from "@/components/parent-dashboard";
import AdminDashboard from "@/components/admin-dashboard";

export default function DashboardPage() {
  const { userInfo, logout } = useAuth();

  // 如果没有用户信息，显示加载状态
  // 这种情况理论上不应该发生，因为 AuthProvider 会重定向未登录用户
  // 但保留为安全措施和更好的用户体验
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4 space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 根据角色返回相应的仪表盘组件
  switch (userInfo.role) {
    case "admin":
      return <AdminDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "child":
      return <Dashboard />;
    default:
      // 角色不明确时显示错误信息
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-bold text-red-600">访问错误</h2>
            <p className="text-gray-700">无法确定您的用户角色，请联系管理员。</p>
            <button 
              onClick={logout}
              className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              返回登录
            </button>
          </div>
        </div>
      );
  }
}