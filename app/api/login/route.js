import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // 基本输入验证
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "用户名和密码不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // 检查登录限制
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    const loginAttempt = await prisma.login_attempt.findFirst({
      where: {
        username,
        timestamp: {
          gte: oneMinuteAgo
        }
      }
    });

    if (loginAttempt && loginAttempt.count >= 3) {
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      if (loginAttempt.timestamp > fiveMinutesAgo) {
        const remainingTime = Math.ceil((5 * 60 * 1000 - (now - loginAttempt.timestamp)) / 1000);
        return new Response(JSON.stringify({ 
          error: `登录失败次数过多，请${remainingTime}秒后再试` 
        }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    
    const user = await prisma.account.findFirst({ where: { username } });

    console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // 登录失败，更新失败记录
      if (loginAttempt) {
        await prisma.login_attempt.update({
          where: { id: loginAttempt.id },
          data: {
            count: loginAttempt.count + 1,
            timestamp: now,
            updated_at: now
          }
        });
      } else {
        await prisma.login_attempt.create({
          data: {
            username,
            count: 1,
            timestamp: now,
            created_at: now,
            updated_at: now
          }
        });
      }

      return new Response(JSON.stringify({ error: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 登录成功，清除失败记录
    if (loginAttempt) {
      await prisma.login_attempt.delete({
        where: { id: loginAttempt.id }
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