import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import bcrypt from "bcrypt";

// 获取所有孩子
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 根据用户id获取家庭id
    const parent = await prisma.account.findUnique({
      where: { id: request.user.id },
      select: { family_id: true },
    });

    // 构建查询条件
    const where = {};
    where.family_id = parseInt(parent.family_id);

    // 添加角色条件，只查询孩子角色
    where.role = "child";

    console.log(where)

    // 查询数据库
    const children = await prisma.account.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        age: true,
        gender: true,
        grade: true,
        integral: true,
        family_id: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // 格式化数据
    const formattedChildren = children.map((child) => ({
      id: child.id,
      username: child.username,
      name: child.name,
      age: child.age,
      gender: child.gender,
      grade: child.grade !== null ? child.grade.toString() : null,
      points: child.integral || 0,
      family_id: child.family_id,
      avatar: "/placeholder.svg?height=40&width=40",
      created_at: child.created_at ? formatDateTime(child.created_at) : null,
      updated_at: child.updated_at ? formatDateTime(child.updated_at) : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取孩子列表成功",
      data: formattedChildren,
    });
  } catch (error) {
    console.error("获取孩子列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取孩子列表失败", error: error.message },
      { status: 500 }
    );
  }
});

// 创建新孩子
export const POST = withAuth(["admin"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.name || !data.family_id) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段" },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.account.findFirst({
      where: { username: data.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { code: 400, message: "用户名已存在，请使用其他用户名" },
        { status: 400 }
      );
    }

    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建新孩子账户
    const newChild = await prisma.account.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: "child",
        age: data.age || null,
        integral: data.points || 0,
        gender: data.gender || null,
        grade: data.grade ? parseInt(data.grade) : null,
        family_id: parseInt(data.family_id),
        created_at: new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        ),
        updated_at: new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        ),
        created_user_id: request.user.id || null,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "孩子添加成功",
      data: {
        id: newChild.id,
        username: newChild.username,
        name: newChild.name,
        age: newChild.age,
        gender: newChild.gender,
        grade: newChild.grade !== null ? newChild.grade.toString() : null,
        points: newChild.integral || 0,
        family_id: newChild.family_id,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    });
  } catch (error) {
    console.error("添加孩子失败:", error);
    return NextResponse.json(
      { code: 500, message: "添加孩子失败", error: error.message },
      { status: 500 }
    );
  }
});

// 更新孩子信息
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

    // 检查孩子是否存在
    const existingChild = await prisma.account.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!existingChild) {
      return NextResponse.json(
        { code: 404, message: "孩子不存在" },
        { status: 404 }
      );
    }

    // 检查是否为孩子角色
    if (existingChild.role !== "child") {
      return NextResponse.json(
        { code: 400, message: "只能更新孩子角色的账户" },
        { status: 400 }
      );
    }

    // 如果用户名被修改，检查新用户名是否已存在
    if (data.username && data.username !== existingChild.username) {
      const existingUser = await prisma.account.findFirst({
        where: { username: data.username },
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
      username: data.username || existingChild.username,
      age: data.age || existingChild.age,
      integral:
        data.points !== undefined ? data.points : existingChild.integral,
      gender: data.gender || existingChild.gender,
      grade: data.grade ? parseInt(data.grade) : existingChild.grade,
      updated_at: new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      ),
      updated_user_id: request.user.id || null,
    };

    // 更新孩子信息
    const updatedChild = await prisma.account.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });

    console.log(
      "更新孩子时间:",
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );

    return NextResponse.json({
      code: 200,
      message: "孩子信息更新成功",
      data: {
        id: updatedChild.id,
        username: updatedChild.username,
        name: updatedChild.name,
        age: updatedChild.age,
        gender: updatedChild.gender,
        grade:
          updatedChild.grade !== null ? updatedChild.grade.toString() : null,
        points: updatedChild.integral || 0,
        family_id: updatedChild.family_id,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    });
  } catch (error) {
    console.error("更新孩子信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新孩子信息失败", error: error.message },
      { status: 500 }
    );
  }
});

// 删除孩子
export const DELETE = withAuth(["admin"], async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { code: 400, message: "缺少孩子ID" },
        { status: 400 }
      );
    }

    // 检查孩子是否存在
    const child = await prisma.account.findUnique({
      where: { id: parseInt(id) },
    });

    if (!child) {
      return NextResponse.json(
        { code: 404, message: "孩子不存在" },
        { status: 404 }
      );
    }

    // 检查是否为孩子角色
    if (child.role !== "child") {
      return NextResponse.json(
        { code: 400, message: "只能删除孩子角色的账户" },
        { status: 400 }
      );
    }

    // 删除孩子
    await prisma.account.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      code: 200,
      message: "孩子删除成功",
      data: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("删除孩子失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除孩子失败", error: error.message },
      { status: 500 }
    );
  }
});
