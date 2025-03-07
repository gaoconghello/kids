import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

// 高阶函数：用户认证和权限控制
export function withAuth(requiredRoles, handler) {
  // 确保 requiredRoles 始终是数组
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return async (request, ...args) => {
    // 获取请求路径用于日志记录
    const url = request.nextUrl?.toString() || request.url;
    
    // 记录API请求
    console.log(`[API请求] 收到请求: ${url}`);
    
    // 获取并验证 token
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(`[认证失败] 未授权访问: ${url} - 未提供token`);
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJWT(token);

    if (!decoded) {
      console.log(`[认证失败] Token无效或已过期: ${url}`);
      return NextResponse.json({ error: "Token 无效或已过期" }, { status: 401 });
    }

    // 记录用户信息和角色
    console.log(`[用户认证] 用户ID: ${decoded.id}, 用户名: ${decoded.username}, 角色: ${decoded.role}, URL: ${url}`);

    // 如果 roles 为空数组，表示所有角色都可以访问
    // 否则检查用户角色是否在允许的角色列表中
    if (roles.length > 0 && !roles.includes(decoded.role)) {
      console.log(`[权限不足] 用户ID: ${decoded.id}, 用户名: ${decoded.username}, 角色: ${decoded.role}, 需要角色: ${roles.join(', ')}, URL: ${url}`);
      return NextResponse.json({ error: "Forbidden: Insufficient role" }, { status: 403 });
    }

    // 将 decoded 信息附加到 request 上
    request.user = decoded;

    // 调用原始处理函数
    return handler(request, ...args);
  };
}