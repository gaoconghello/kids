import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 兑换奖励
export const PUT = withAuth(["child", "parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.rewardId) {
      return NextResponse.json(
        { code: 400, message: "缺少奖励ID" },
        { status: 400 }
      );
    }

    // 检查奖励是否存在
    const existingReward = await prisma.reward.findUnique({
      where: { id: parseInt(data.rewardId) },
    });

    if (!existingReward) {
      return NextResponse.json(
        { code: 404, message: "奖励不存在" },
        { status: 404 }
      );
    }
    
    // 创建奖励兑换记录
    const currentDateTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const rewardHistory = await prisma.reward_history.create({
      data: {
        reward_id: existingReward.id,
        review: "0", // 待审核
        child_id: request.user.id,
        created_at: currentDateTime,
        updated_at: currentDateTime,
        created_user_id: request.user.id,
        updated_user_id: request.user.id
      }
    });

    return NextResponse.json({
      code: 200,
      message: "奖励兑换申请成功",
      data: {
        id: rewardHistory.id,
        reward_id: rewardHistory.reward_id,
        reward_name: existingReward.name,
        reward_integral: existingReward.integral,
        child_id: rewardHistory.child_id,
        review: rewardHistory.review,
        created_at: formatDateTime(rewardHistory.created_at),
      },
    });
  } catch (error) {
    console.error("奖励兑换失败:", error);
    return NextResponse.json(
      { code: 500, message: "奖励兑换失败", error: error.message },
      { status: 500 }
    );
  }
});
