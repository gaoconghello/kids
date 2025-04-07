import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import bcrypt from "bcrypt";

// 更新账户密码
export const PUT = withAuth(["admin", "parent", "child"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.password || !data.newPassword) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段：需要旧密码和新密码" },
        { status: 400 }
      );
    }

    // 检查账户是否存在
    const existingAccount = await prisma.account.findUnique({
      where: { id: parseInt(request.user.id) },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { code: 404, message: "账户不存在" },
        { status: 404 }
      );
    }

    // 验证旧密码是否正确
    const isPasswordValid = await bcrypt.compare(data.password, existingAccount.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { code: 400, message: "旧密码验证失败" },
        { status: 400 }
      );
    }

    // 对新密码进行加密
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // 更新账户密码
    const updatedAccount = await prisma.account.update({
      where: { id: parseInt(request.user.id) },
      data: {
        password: hashedPassword,
        updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        updated_user_id: request.user.id || null,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "密码更新成功",
      data: {
        id: updatedAccount.id,
        username: updatedAccount.username,
        name: updatedAccount.name,
      },
    });
  } catch (error) {
    console.error("更新密码失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新密码失败", error: error.message },
      { status: 500 }
    );
  }
});
