import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 家长获取积分历史列表
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    // 如果没有提供childId，直接返回空数据
    if (!childId) {
      return NextResponse.json(
        {
          code: 400,
          message: "缺少必要参数childId",
          data: [],
        },
        { status: 400 }
      );
    }

    // 获取当前家长信息
    const parent = await prisma.account.findUnique({
      where: { id: request.user.id },
      select: { family_id: true },
    });

    if (!parent) {
      return NextResponse.json(
        { code: 403, message: "无法验证家长身份" },
        { status: 403 }
      );
    }

    // 验证child是否属于该family
    const child = await prisma.account.findUnique({
      where: { id: parseInt(childId) },
      select: { family_id: true },
    });

    if (!child || child.family_id !== parent.family_id) {
      return NextResponse.json(
        { code: 403, message: "无权查看此孩子的积分历史" },
        { status: 403 }
      );
    }

    // 构建查询条件
    const where = {
      child_id: parseInt(childId)
    };

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
      integral_type: history.integral_type,
      integral: history.integral,
      child_id: history.child_id,
      family_id: history.family_id,
      integral_date: history.integral_date ? formatDateTime(history.integral_date) : null,
      name: history.name,
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
