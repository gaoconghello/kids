"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // 主页逻辑简化：
    // 已登录用户直接跳转到仪表盘，未登录用户跳转到登录页
    // 这个逻辑在AuthProvider中已经处理，这里只是为了确保
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // 返回一个简单的加载指示器，避免空白页面
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-purple-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">小朋友积分乐园</h2>
        <p className="mt-2 text-white">正在跳转...</p>
      </div>
    </div>
  );
}
