import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

// 定义不需要验证的公共路径
const publicPaths = [
  '/api/login',
  '/api/auth',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 如果是公共路径，直接通过
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 获取并验证 token
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // 返回 401 未授权
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }
  
  // 验证 JWT token
  const payload = verifyJWT(token);
  
  if (!payload) {
    // Token 无效或过期
    return NextResponse.json(
      { error: 'Token 无效或已过期' },
      { status: 401 }
    );
  }
  
  // 通过所有检查，允许访问
  return NextResponse.next();
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    '/api/:path*'  // 只匹配 API 路由
  ],
};