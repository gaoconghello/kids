import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import bcrypt from "bcryptjs";

// 获取当前登录用户信息
export const GET = withAuth([], async (request) => {
  try {
    // 从请求中获取当前用户ID
    const userId = request.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { code: 401, message: "未授权访问" },
        { status: 401 }
      );
    }

    // 查询用户信息
    const account = await prisma.account.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        age: true,
        gender: true,
        grade: true,
        integral: true,
        family_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { code: 404, message: "用户不存在" },
        { status: 404 }
      );
    }

    // 格式化数据
    const formattedAccount = {
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      age: account.age,
      gender: account.gender,
      grade: account.grade !== null ? account.grade.toString() : null,
      points: account.integral || 0,
      family_id: account.family_id,
      avatar: "/placeholder.svg?height=40&width=40",
      created_at: account.created_at ? formatDateTime(account.created_at) : null,
      updated_at: account.updated_at ? formatDateTime(account.updated_at) : null,
    };

    return NextResponse.json({
      code: 200,
      message: "获取用户信息成功",
      data: formattedAccount,
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取用户信息失败", error: error.message },
      { status: 500 }
    );
  }
});

// 创建新账户
export const POST = withAuth(["admin"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.username || !data.password || !data.name || !data.role) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段" },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.account.findFirst({
      where: { username: data.username }
    });

    if (existingUser) {
      return NextResponse.json(
        { code: 400, message: "用户名已存在，请使用其他用户名" },
        { status: 400 }
      );
    }

    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建新账户
    const newAccount = await prisma.account.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        age: data.age || null,
        integral: data.points || 0,
        gender: data.gender || null,
        grade: data.grade ? parseInt(data.grade) : null,
        family_id: data.family_id ? parseInt(data.family_id) : null,
        created_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        created_user_id: request.user.id || null,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "账户创建成功",
      data: {
        id: newAccount.id,
        username: newAccount.username,
        name: newAccount.name,
        role: newAccount.role,
        age: newAccount.age,
        gender: newAccount.gender,
        grade: newAccount.grade !== null ? newAccount.grade.toString() : null,
        points: newAccount.integral || 0,
        family_id: newAccount.family_id,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    });
  } catch (error) {
    console.error("创建账户失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建账户失败", error: error.message },
      { status: 500 }
    );
  }
});

// 更新账户信息
export const PUT = withAuth(["admin"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.id || !data.name) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段" },
        { status: 400 }
      );
    }

    // 检查账户是否存在
    const existingAccount = await prisma.account.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { code: 404, message: "账户不存在" },
        { status: 404 }
      );
    }

    // 如果用户名被修改，检查新用户名是否已存在
    if (data.username && data.username !== existingAccount.username) {
      const existingUser = await prisma.account.findFirst({
        where: { username: data.username }
      });

      if (existingUser) {
        return NextResponse.json(
          { code: 400, message: "用户名已存在，请使用其他用户名" },
          { status: 400 }
        );
      }
    }

    // 构建更新数据
    const updateData = {
      name: data.name,
      username: data.username || existingAccount.username,
      role: data.role || existingAccount.role,
      age: data.age !== undefined ? data.age : existingAccount.age,
      integral: data.points !== undefined ? data.points : existingAccount.integral,
      gender: data.gender !== undefined ? data.gender : existingAccount.gender,
      grade: data.grade ? parseInt(data.grade) : existingAccount.grade,
      family_id: data.family_id ? parseInt(data.family_id) : existingAccount.family_id,
      updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
      updated_user_id: request.user.id || null,
    };

    // 如果提供了新密码，则更新密码
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // 更新账户信息
    const updatedAccount = await prisma.account.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });

    return NextResponse.json({
      code: 200,
      message: "账户信息更新成功",
      data: {
        id: updatedAccount.id,
        username: updatedAccount.username,
        name: updatedAccount.name,
        role: updatedAccount.role,
        age: updatedAccount.age,
        gender: updatedAccount.gender,
        grade: updatedAccount.grade !== null ? updatedAccount.grade.toString() : null,
        points: updatedAccount.integral || 0,
        family_id: updatedAccount.family_id,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    });
  } catch (error) {
    console.error("更新账户信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新账户信息失败", error: error.message },
      { status: 500 }
    );
  }
});

// 删除账户
export const DELETE = withAuth(["admin"], async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { code: 400, message: "缺少账户ID" },
        { status: 400 }
      );
    }

    // 检查账户是否存在
    const account = await prisma.account.findUnique({
      where: { id: parseInt(id) },
    });

    if (!account) {
      return NextResponse.json(
        { code: 404, message: "账户不存在" },
        { status: 404 }
      );
    }

    // 删除账户
    await prisma.account.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      code: 200,
      message: "账户删除成功",
      data: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("删除账户失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除账户失败", error: error.message },
      { status: 500 }
    );
  }
});
