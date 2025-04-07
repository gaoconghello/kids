import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取奖励列表
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 通过当前用户ID查询child信息
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

    // 构建查询条件，只查询该家长所在家庭的奖励
    const where = {
      family_id: parent.family_id
    };

    // 查询数据库
    const rewards = await prisma.reward.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
    });

    // 格式化数据
    const formattedRewards = rewards.map((reward) => ({
      id: reward.id,
      name: reward.name,
      integral: reward.integral || 0,
      family_id: reward.family_id,
      pic: reward.pic,
      pic_ext: reward.pic_ext,
      created_at: reward.created_at ? formatDateTime(reward.created_at) : null,
      updated_at: reward.updated_at ? formatDateTime(reward.updated_at) : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取奖励列表成功",
      data: formattedRewards,
    });
  } catch (error) {
    console.error("获取奖励列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取奖励列表失败", error: error.message },
      { status: 500 }
    );
  }
});

// 创建新奖励
export const POST = withAuth(["parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.name || !data.integral) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段" },
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

    // 创建新奖励
    const newReward = await prisma.reward.create({
      data: {
        name: data.name,
        integral: parseInt(data.integral),
        family_id: parent.family_id,
        pic: data.pic || null,
        pic_ext: data.pic_ext || null,
        created_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        created_user_id: request.user.id,
        updated_user_id: request.user.id,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "奖励添加成功",
      data: {
        id: newReward.id,
        name: newReward.name,
        integral: newReward.integral,
        family_id: newReward.family_id,
        pic: newReward.pic,
        pic_ext: newReward.pic_ext,
        created_at: formatDateTime(newReward.created_at),
      },
    });
  } catch (error) {
    console.error("添加奖励失败:", error);
    return NextResponse.json(
      { code: 500, message: "添加奖励失败", error: error.message },
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

// 删除奖励
export const DELETE = withAuth(["admin", "parent"], async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { code: 400, message: "缺少奖励ID" },
        { status: 400 }
      );
    }

    // 检查奖励是否存在
    const reward = await prisma.reward.findUnique({
      where: { id: parseInt(id) },
    });

    if (!reward) {
      return NextResponse.json(
        { code: 404, message: "奖励不存在" },
        { status: 404 }
      );
    }

    // 检查是否有关联的奖励历史记录
    const rewardHistory = await prisma.reward_history.findFirst({
      where: { reward_id: parseInt(id) },
    });

    if (rewardHistory) {
      return NextResponse.json(
        { code: 400, message: "该奖励已被使用，无法删除" },
        { status: 400 }
      );
    }

    // 删除奖励
    await prisma.reward.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      code: 200,
      message: "奖励删除成功",
    });
  } catch (error) {
    console.error("删除奖励失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除奖励失败", error: error.message },
      { status: 500 }
    );
  }
});
