import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取积分历史列表
export const GET = withAuth(["child"], async (request) => {
  try {
    // 构建查询条件
    const where = {};
    
    // 只能查看自己的积分历史
    where.child_id = request.user.id;
    
    // 查询数据库
    const histories = await prisma.integral_history.findMany({
      where,
      orderBy: {
        integral_date: "desc",
      },
    });

    // 格式化数据
    const formattedHistories = histories.map((history) => ({
      id: history.id,
      integral_id: history.integral_id,
      name: history.name,
      integral_type: history.integral_type,
      integral: history.integral,
      child_id: history.child_id,
      family_id: history.family_id,
      integral_date: history.integral_date ? formatDateTime(history.integral_date) : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取积分历史列表成功",
      data: formattedHistories,
    });
  } catch (error) {
    console.error("获取积分历史列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取积分历史列表失败", error: error.message },
      { status: 500 }
    );
  }
});

// 创建新积分历史记录 - 孩子不能创建积分记录
export const POST = withAuth(["child"], async (request) => {
  return NextResponse.json(
    { code: 403, message: "孩子无权创建积分记录" },
    { status: 403 }
  );
});

// 更新积分历史记录 - 孩子不能更新积分记录
export const PUT = withAuth(["child"], async (request) => {
  return NextResponse.json(
    { code: 403, message: "孩子无权更新积分记录" },
    { status: 403 }
  );
});

// 删除积分历史记录 - 孩子不能删除积分记录
export const DELETE = withAuth(["child"], async (request) => {
  return NextResponse.json(
    { code: 403, message: "孩子无权删除积分记录" },
    { status: 403 }
  );
});
