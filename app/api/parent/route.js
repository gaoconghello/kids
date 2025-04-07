import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { formatDateTime } from "@/lib/utils";

const prisma = new PrismaClient();

// 获取所有家长
export async function GET(request) {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    
    // 构建查询条件
    const where = {};
    if (familyId) {
      where.family_id = parseInt(familyId);
    }
    
    // 添加角色条件，只查询家长角色
    where.role = "parent";
    
    // 查询数据库
    const parents = await prisma.account.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        mobile: true,
        family_id: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    
    // 格式化日期时间
    const formattedParents = parents.map(parent => ({
      ...parent,
      created_at: parent.created_at ? formatDateTime(parent.created_at) : null,
      updated_at: parent.updated_at ? formatDateTime(parent.updated_at) : null
    }));
    
    return NextResponse.json({ success: true, data: formattedParents });
  } catch (error) {
    console.error("获取家长列表失败:", error);
    return NextResponse.json(
      { success: false, message: "获取家长列表失败", error: error.message },
      { status: 500 }
    );
  }
}

// 创建新家长
export async function POST(request) {
  try {
    const data = await request.json();
    
    // 验证必填字段
    if (!data.username || !data.password || !data.name || !data.family_id) {
      return NextResponse.json(
        { success: false, message: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 检查用户名是否已存在
    const existingUser = await prisma.account.findFirst({
      where: { username: data.username },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "用户名已存在" },
        { status: 400 }
      );
    }
    
    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // 创建新家长账户
    const newParent = await prisma.account.create({
      data: {
        username: data.username,
        password: hashedPassword, // 使用加密后的密码
        name: data.name,
        role: "parent",
        mobile: data.mobile,
        family_id: parseInt(data.family_id),
        created_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        created_user_id: data.created_user_id || null,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "家长添加成功",
      data: {
        id: newParent.id,
        username: newParent.username,
        name: newParent.name,
        family_id: newParent.family_id,
      },
    });
  } catch (error) {
    console.error("添加家长失败:", error);
    return NextResponse.json(
      { success: false, message: "添加家长失败", error: error.message },
      { status: 500 }
    );
  }
}

// 更新家长信息
export async function PUT(request) {
  try {
    const data = await request.json();
    
    // 验证必填字段
    if (!data.id || !data.username || !data.name) {
      return NextResponse.json(
        { success: false, message: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 检查用户名是否已被其他用户使用
    const existingUser = await prisma.account.findFirst({
      where: {
        username: data.username,
        id: { not: parseInt(data.id) },
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "用户名已被其他用户使用" },
        { status: 400 }
      );
    }
    
    // 构建更新数据
    const updateData = {
      username: data.username,
      name: data.name,
      mobile: data.mobile,
      updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
      updated_user_id: data.updated_user_id || null,
    };
    
    // 如果提供了新密码，则更新密码
    if (data.password) {
      // 对新密码进行加密
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    // 更新家长信息
    const updatedParent = await prisma.account.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      message: "家长信息更新成功",
      data: {
        id: updatedParent.id,
        username: updatedParent.username,
        name: updatedParent.name,
        family_id: updatedParent.family_id,
      },
    });
  } catch (error) {
    console.error("更新家长信息失败:", error);
    return NextResponse.json(
      { success: false, message: "更新家长信息失败", error: error.message },
      { status: 500 }
    );
  }
}

// 删除家长
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "缺少家长ID" },
        { status: 400 }
      );
    }
    
    // 检查家长是否存在
    const parent = await prisma.account.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!parent) {
      return NextResponse.json(
        { success: false, message: "家长不存在" },
        { status: 404 }
      );
    }
    
    // 检查是否为家长角色
    if (parent.role !== "parent") {
      return NextResponse.json(
        { success: false, message: "只能删除家长角色的账户" },
        { status: 400 }
      );
    }
    
    // 删除家长
    await prisma.account.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({
      success: true,
      message: "家长删除成功",
    });
  } catch (error) {
    console.error("删除家长失败:", error);
    return NextResponse.json(
      { success: false, message: "删除家长失败", error: error.message },
      { status: 500 }
    );
  }
}
