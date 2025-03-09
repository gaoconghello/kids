"use client";

export default function Loading() {
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