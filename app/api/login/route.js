import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log(username, password);
    
    // 基本输入验证
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "用户名和密码不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const user = await prisma.account.findFirst({ where: { username } });

    console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Response(JSON.stringify({ error: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = signJWT({ 
      id: user.id, 
      username: user.username,
      role: user.role
    });

    // 返回token和基本用户信息（不包含敏感数据）
    return new Response(JSON.stringify({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("登录错误:", error);
    return new Response(JSON.stringify({ error: "登录过程中发生错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}