import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

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
        id: request.user.id
      }
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
      }
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
      review: "0" // 固定只查询待审核的记录
    };
    
    // 查询奖励历史记录
    const rewardHistories = await prisma.reward_history.findMany({
      where: whereCondition,
      orderBy: {
        created_at: "desc",
      },
      include: {
        reward: true, // 关联奖励表获取奖励信息
      }
    });

    // 格式化数据
    const formattedHistories = rewardHistories.map((history) => ({
      id: history.id,
      reward_id: history.reward_id,
      reward_name: history.reward?.name || '未知奖励',
      reward_integral: history.reward?.integral || 0,
      child_id: history.child_id,
      child_name: child.name || '未知用户',
      review: history.review,
      review_time: history.review_time ? formatDateTime(history.review_time) : null,
      created_at: history.created_at ? formatDateTime(history.created_at) : null,
      updated_at: history.updated_at ? formatDateTime(history.updated_at) : null,
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

// 更新奖励信息
export const PUT = withAuth(["admin", "parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.id) {
      return NextResponse.json(
        { code: 400, message: "缺少奖励ID" },
        { status: 400 }
      );
    }

    // 检查奖励是否存在
    const existingReward = await prisma.reward.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!existingReward) {
      return NextResponse.json(
        { code: 404, message: "奖励不存在" },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData = {};
    
    // 更新字段
    if (data.name) updateData.name = data.name;
    if (data.integral !== undefined) updateData.integral = parseInt(data.integral);
    if (data.family_id) updateData.family_id = parseInt(data.family_id);
    if (data.pic !== undefined) updateData.pic = data.pic;
    if (data.pic_ext !== undefined) updateData.pic_ext = data.pic_ext;
    
    // 通用更新字段
    updateData.updated_at = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    updateData.updated_user_id = request.user.id;

    // 更新奖励信息
    const updatedReward = await prisma.reward.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });

    return NextResponse.json({
      code: 200,
      message: "奖励信息更新成功",
      data: {
        id: updatedReward.id,
        name: updatedReward.name,
        integral: updatedReward.integral,
        family_id: updatedReward.family_id,
        pic: updatedReward.pic,
        pic_ext: updatedReward.pic_ext,
        updated_at: formatDateTime(updatedReward.updated_at),
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
