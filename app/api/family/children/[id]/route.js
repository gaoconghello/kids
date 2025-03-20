import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 根据id获取孩子信息
export const GET = withAuth(["parent"], async (request, { params }) => {
  try {
    const childId = params.id; // 获取动态参数 id

    // 根据用户id获取家庭id
    const parent = await prisma.account.findUnique({
      where: { id: request.user.id },
    });

    // 根据childId获取孩子信息
    const child = await prisma.account.findUnique({
      where: { id: parseInt(childId) },
    });

    // 如果孩子信息不存在，返回404
    if (!child) {
      return NextResponse.json(
        {
          code: 404,
          message: "孩子信息不存在",
        },
        { status: 404 }
      );
    }

    // 如果parent和child不在同一个家庭，返回403
    if (parent.family_id !== child.family_id) {
      return NextResponse.json(
        { code: 403, message: "无权限访问" },
        { status: 403 }
      );
    }

    // 以今天为结束时间，获取之前7天的积分历史
    const endDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    // 根据childId获取integral_history
    const integralHistory = await prisma.integral_history.findMany({
      where: {
        child_id: parseInt(childId),
        integral_date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    

    //     total: 350,
    // thisWeek: 85,
    // thisMonth: 280,
    // thisWeekSpent: 30,
    // 计算积分历史
    let points = child.integral || 0;

    // 本周积分
    let thisWeekPoints = 0;
    // 本周消耗积分
    let thisWeekSpentPoints = 0;
    
    // 01：作业，02：任务，03：其他奖励，04：消耗积分    
    // 统计integral_type为01，02，03的积分之和，赋值给本周积分
    integralHistory.forEach((item) => {
      if (item.integral_type === "01" || item.integral_type === "02" || item.integral_type === "03") {
        thisWeekPoints += item.integral;
      }
      // 如果integral_type为04，减去积分
      if (item.integral_type === "04") {
        thisWeekSpentPoints += item.integral;
      }
    });

    // 格式化数据
    const formattedChild = {
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

      total: points,
      thisWeek: thisWeekPoints,
      thisWeekSpent: thisWeekSpentPoints,
    };

    // 如果孩子信息存在，返回孩子信息
    return NextResponse.json({
      code: 200,
      message: "获取孩子信息成功",
      data: formattedChild,
    });
  } catch (error) {
    console.error("获取孩子列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取孩子列表失败", error: error.message },
      { status: 500 }
    );
  }
});
