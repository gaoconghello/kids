import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { INTEGRAL_TYPE } from "@/lib/constants";

// 获取奖励历史列表
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    // 必须传入 childId 参数
    if (!childId) {
      return NextResponse.json(
        { code: 400, message: "缺少儿童ID参数" },
        { status: 400 }
      );
    }

    // 通过当前用户ID查询parent信息
    const parent = await prisma.account.findUnique({
      where: {
        id: request.user.id,
      },
    });

    if (!parent || !parent.family_id) {
      return NextResponse.json(
        { code: 400, message: "无法获取家庭信息" },
        { status: 400 }
      );
    }

    // 验证该儿童是否属于当前家庭
    const child = await prisma.account.findFirst({
      where: {
        id: parseInt(childId),
        family_id: parent.family_id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { code: 400, message: "无效的儿童ID" },
        { status: 400 }
      );
    }

    // 构建查询条件
    const whereCondition = {
      child_id: parseInt(childId),
      review: "0", // 固定只查询待审核的记录
    };

    // 查询奖励历史记录
    const rewardHistories = await prisma.reward_history.findMany({
      where: whereCondition,
      orderBy: {
        created_at: "desc",
      },
      include: {
        reward: true, // 关联奖励表获取奖励信息
      },
    });

    // 格式化数据
    const formattedHistories = rewardHistories.map((history) => ({
      id: history.id,
      reward_id: history.reward_id,
      reward_name: history.reward?.name || "未知奖励",
      reward_integral: history.reward?.integral || 0,
      child_id: history.child_id,
      child_name: child.name || "未知用户",
      review: history.review,
      review_time: history.review_time
        ? formatDateTime(history.review_time)
        : null,
      created_at: history.created_at
        ? formatDateTime(history.created_at)
        : null,
      updated_at: history.updated_at
        ? formatDateTime(history.updated_at)
        : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取待审核奖励列表成功",
      data: formattedHistories,
    });
  } catch (error) {
    console.error("获取待审核奖励列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取待审核奖励列表失败", error: error.message },
      { status: 500 }
    );
  }
});

// 审核奖励信息
export const PUT = withAuth(["parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.id) {
      return NextResponse.json(
        { code: 400, message: "缺少奖励ID" },
        { status: 400 }
      );
    }

    if (data.approved === undefined || ![1, 2, "1", "2"].includes(data.approved)) {
      return NextResponse.json(
        { code: 400, message: "审批状态必须为1(同意)或2(拒绝)" },
        { status: 400 }
      );
    }

    // 检查奖励是否存在
    const existingRewardHistory = await prisma.reward_history.findUnique({
      where: { id: parseInt(data.id) },
      include: {
        reward: true, // 关联奖励表获取奖励信息
      },
    });

    if (!existingRewardHistory) {
      return NextResponse.json(
        { code: 404, message: "奖励不存在" },
        { status: 404 }
      );
    }

    // 根据child_id查询child信息
    const child = await prisma.account.findUnique({
      where: { id: existingRewardHistory.child_id },
    });

    // 根据当前用户id获取parent信息
    const parent = await prisma.account.findUnique({
      where: { id: request.user.id },
    });

    // 如果parent和child不在同一个家庭，则返回错误
    if (parent.family_id !== child.family_id) {
      return NextResponse.json(
        { code: 400, message: "无法审核奖励" },
        { status: 400 }
      );
    }

    // 构建通用更新数据
    const updateData = {
      review: String(data.approved) === "1" ? "1" : "2",
      review_time: new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      ),
      updated_at: new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      ),
      updated_user_id: request.user.id
    };

    // 使用事务处理所有数据库操作
    const result = await prisma.$transaction(async (tx) => {
      // 更新奖励信息
      const updatedRewardHistory = await tx.reward_history.update({
        where: { id: parseInt(data.id) },
        data: updateData,
      });

      // 如果审核通过，需要更新积分
      if (String(data.approved) === "1") {
        // 更新child的积分
        await tx.account.update({
          where: { id: child.id },
          data: {
            integral: child.integral - existingRewardHistory.reward?.integral,
          },
        });

        // 创建积分历史记录
        await tx.integral_history.create({
          data: {
            integral_id: existingRewardHistory.id,
            integral_type: INTEGRAL_TYPE.REWARD,
            child_id: child.id,
            family_id: child.family_id,
            integral: existingRewardHistory.reward?.integral,
            integral_date: new Date(
              new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
            ),
            name: "兑换" + existingRewardHistory.reward?.name,
          },
        });
      }
      
      return updatedRewardHistory;
    });

    return NextResponse.json({
      code: 200,
      message: String(data.approved) === "1" ? "奖励审核成功" : "奖励审核被拒绝",
      data: {
        id: result.id,
        reward_id: result.reward_id,
        reward_name: existingRewardHistory.reward?.name || "未知奖励",
        reward_integral: existingRewardHistory.reward?.integral || 0,
        child_id: result.child_id,
        child_name: "未知用户", // 如需正确显示，可能需要额外查询
        review: result.review,
        review_time: result.review_time
          ? formatDateTime(result.review_time)
          : null,
        created_at: result.created_at
          ? formatDateTime(result.created_at)
          : null,
      },
    });
  } catch (error) {
    console.error("更新奖励信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新奖励信息失败", error: error.message },
      { status: 500 }
    );
  }
});
