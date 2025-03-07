import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

// 高阶函数：角色保护
export function withRole(requiredRoles, handler) {
  // 确保 requiredRoles 始终是数组
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return async (request, ...args) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJWT(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 如果 roles 为空数组，表示所有角色都可以访问
    // 否则检查用户角色是否在允许的角色列表中
    if (roles.length > 0 && !roles.includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient role" }, { status: 403 });
    }

    // 将 decoded 信息附加到 request 上（可选）
    request.user = decoded;

    // 调用原始处理函数
    return handler(request, ...args);
  };
}