import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";
import { formatDateTime } from "@/lib/utils";

// 定义Zod验证模式
const createFamilySchema = z.object({
  name: z
    .string()
    .min(1, "家庭名称不能为空")
    .max(50, "家庭名称不能超过50个字符"),
});

const updateFamilySchema = z.object({
  id: z.number().int().positive("家庭ID必须是正整数"),
  name: z
    .string()
    .min(1, "家庭名称不能为空")
    .max(50, "家庭名称不能超过50个字符"),
});

const deleteFamilySchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "家庭ID必须是正整数",
  }),
});

// GET 方法：获取所有家庭信息
export const GET = withAuth("admin", async (request) => {
  try {
    // 查询所有家庭信息
    const families = await prisma.family.findMany({
      orderBy: {
        id: "asc",
      },
    });

    // 为每个家庭查询关联的父母和孩子信息
    const familiesWithMembers = await Promise.all(
      families.map(async (family) => {
        // 查询该家庭的父母（role为parent的账户）
        const parents = await prisma.account.findMany({
          where: {
            family_id: family.id,
            role: "parent",
          },
          select: {
            id: true,
            username: true,
            name: true,
            mobile: true,
          },
        });

        // 查询该家庭的孩子（role为child的账户）
        const children = await prisma.account.findMany({
          where: {
            family_id: family.id,
            role: "child",
          },
          select: {
            id: true,
            username: true,
            name: true,
            age: true,
            integral: true,
            gender: true,
            grade: true,
          },
        });

        // 格式化孩子数据，将integral重命名为points并添加默认头像
        const formattedChildren = children.map((child) => ({
          id: child.id,
          name: child.name,
          username: child.username,
          age: child.age,
          avatar: "/placeholder.svg?height=40&width=40",
          points: child.integral || 0,
          gender: child.gender,
          grade: child.grade !== null ? child.grade.toString() : null,
        }));

        // 格式化父母数据，添加默认头像和新增的username和mobile字段
        const formattedParents = parents.map((parent) => ({
          id: parent.id,
          name: parent.name,
          username: parent.username,
          mobile: parent.mobile,
          avatar: "/placeholder.svg?height=40&width=40",
        }));

        // 返回包含家庭成员的完整家庭信息
        return {
          id: family.id,
          name: family.name,
          parents: formattedParents,
          children: formattedChildren,
          createdAt: family.created_at
            ? formatDateTime(family.created_at)
            : null,
        };
      })
    );

    return NextResponse.json({
      code: 200,
      message: "获取家庭列表成功",
      data: familiesWithMembers,
    });
  } catch (error) {
    console.error("获取家庭列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取家庭列表失败", error: error.message },
      { status: 500 }
    );
  }
});

// POST 方法：创建新家庭
export const POST = withAuth("admin", async (request) => {
  try {
    // 解析请求体
    const body = await request.json();

    // 使用Zod验证
    const validationResult = createFamilySchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { code: 400, message: "数据验证失败", errors: errorMessages },
        { status: 400 }
      );
    }

    const { name } = validationResult.data;
    const currentUserId = request.user.id;
    const currentTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));

    // 检查家庭名称是否已存在
    const existingFamily = await prisma.family.findFirst({
      where: { name },
    });

    if (existingFamily) {
      return NextResponse.json(
        { code: 400, message: "家庭名称已存在" },
        { status: 400 }
      );
    }

    // 创建新家庭
    const newFamily = await prisma.family.create({
      data: {
        name: name,
        created_at: currentTime,
        updated_at: currentTime,
        created_user_id: currentUserId,
        updated_user_id: currentUserId,
      },
    });

    // 返回创建的家庭信息
    return NextResponse.json({
      code: 200,
      message: "创建家庭成功",
      data: {
        id: newFamily.id,
        name: newFamily.name,
        parents: [],
        children: [],
        createdAt: newFamily.created_at
          ? formatDateTime(newFamily.created_at)
          : null,
      },
    });
  } catch (error) {
    console.error("创建家庭失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建家庭失败", error: error.message },
      { status: 500 }
    );
  }
});

// PUT 方法：更新家庭信息
export const PUT = withAuth("admin", async (request) => {
  try {
    // 解析请求体
    const body = await request.json();

    // 使用Zod验证
    const validationResult = updateFamilySchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { code: 400, message: "数据验证失败", errors: errorMessages },
        { status: 400 }
      );
    }

    const { id, name } = validationResult.data;
    const currentUserId = request.user.id;
    const currentTime = new Date();

    // 检查家庭是否存在
    const existingFamily = await prisma.family.findUnique({
      where: { id: id },
    });

    if (!existingFamily) {
      return NextResponse.json(
        { code: 404, message: "家庭不存在" },
        { status: 404 }
      );
    }

    // 检查家庭名称是否已被其他家庭使用
    const duplicateFamily = await prisma.family.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (duplicateFamily) {
      return NextResponse.json(
        { code: 400, message: "家庭名称已被其他家庭使用" },
        { status: 400 }
      );
    }

    // 更新家庭信息
    const updatedFamily = await prisma.family.update({
      where: { id: id },
      data: {
        name: name,
        updated_at: currentTime,
        updated_user_id: currentUserId,
      },
    });

    // 查询该家庭的父母和孩子
    const parents = await prisma.account.findMany({
      where: {
        family_id: updatedFamily.id,
        role: "parent",
      },
      select: {
        id: true,
        name: true,
        username: true,
        mobile: true,
      },
    });

    const children = await prisma.account.findMany({
      where: {
        family_id: updatedFamily.id,
        role: "child",
      },
      select: {
        id: true,
        name: true,
        age: true,
        integral: true,
      },
    });

    // 格式化数据
    const formattedParents = parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      username: parent.username,
      mobile: parent.mobile,
      avatar: "/placeholder.svg?height=40&width=40",
    }));

    const formattedChildren = children.map((child) => ({
      id: child.id,
      name: child.name,
      age: child.age,
      avatar: "/placeholder.svg?height=40&width=40",
      points: child.integral || 0,
    }));

    // 返回更新后的家庭信息
    return NextResponse.json({
      code: 200,
      message: "更新家庭成功",
      data: {
        id: updatedFamily.id,
        name: updatedFamily.name,
        parents: formattedParents,
        children: formattedChildren,
        createdAt: updatedFamily.created_at
          ? formatDateTime(updatedFamily.created_at)
          : null,
        updatedAt: updatedFamily.updated_at
          ? formatDateTime(updatedFamily.updated_at)
          : null,
      },
    });
  } catch (error) {
    console.error("更新家庭失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新家庭失败", error: error.message },
      { status: 500 }
    );
  }
});

// DELETE 方法：删除家庭
export const DELETE = withAuth("admin", async (request) => {
  try {
    // 从URL获取家庭ID
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // 使用Zod验证
    const validationResult = deleteFamilySchema.safeParse({ id });
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { code: 400, message: "数据验证失败", errors: errorMessages },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // 检查家庭是否存在
    const existingFamily = await prisma.family.findUnique({
      where: { id: parsedId },
    });

    if (!existingFamily) {
      return NextResponse.json(
        { code: 404, message: "家庭不存在" },
        { status: 404 }
      );
    }

    // 删除家庭前先删除关联的账户
    await prisma.account.deleteMany({
      where: { family_id: parsedId },
    });

    // 删除家庭
    await prisma.family.delete({
      where: { id: parsedId },
    });

    // 返回成功信息
    return NextResponse.json({
      code: 200,
      message: "删除家庭成功",
      data: { id: parsedId },
    });
  } catch (error) {
    console.error("删除家庭失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除家庭失败", error: error.message },
      { status: 500 }
    );
  }
});
