import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";

// 辅助函数：从日期对象中提取HH:MM格式的时间
function formatTimeHHMM(dateObj) {
  if (!dateObj) return null;
  const date = new Date(dateObj);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

const updateFamilySchema = z.object({
  is_deadline: z.string().refine((val) => val === "1" || val === "0", {
    message: "is_deadline必须是1或0",
  }),
  deadline: z
    .string()
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "deadline必须是hh:mm格式的时间",
    }),
  integral: z.number().int().positive("积分必须是正整数"),
});

// GET 方法：获取家庭信息
export const GET = withAuth(["parent", "child"], async (request) => {
  try {
    // 获取当前用户信息
    const currentUser = request.user;

    // 查询当前用户账户信息
    const account = await prisma.account.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        family_id: true,
      },
    });

    if (!account || !account.family_id) {
      return NextResponse.json(
        {
          code: 404,
          message: "未找到相关家庭信息",
          data: null,
        },
        { status: 404 }
      );
    }

    const familyId = account.family_id;

    // 查询指定家庭
    const family = await prisma.family.findUnique({
      where: {
        id: familyId,
      },
    });

    // 如果找不到指定家庭
    if (!family) {
      return NextResponse.json(
        {
          code: 404,
          message: "未找到指定家庭",
        },
        { status: 404 }
      );
    }

    // 返回家庭基本信息
    return NextResponse.json({
      code: 200,
      message: "获取家庭信息成功",
      data: {
        id: family.id,
        name: family.name,
        is_deadline: family.is_deadline,
        deadline: formatTimeHHMM(family.deadline),
        integral: family.integral,
      },
    });
  } catch (error) {
    console.error("获取家庭信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取家庭信息失败", error: error.message },
      { status: 500 }
    );
  }
});

// PUT 方法：更新家庭信息
export const PUT = withAuth("parent", async (request) => {
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

    const { is_deadline, deadline, integral } = validationResult.data;
    const currentUserId = request.user.id;
    const currentTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );

    // 获取当前用户信息
    const currentUser = request.user;

    // 查询当前用户账户信息
    const account = await prisma.account.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        family_id: true,
      },
    });

    if (!account || !account.family_id) {
      return NextResponse.json(
        {
          code: 404,
          message: "未找到相关家庭信息",
          data: null,
        },
        { status: 404 }
      );
    }

    const familyId = account.family_id;

    // 检查家庭是否存在
    const existingFamily = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!existingFamily) {
      return NextResponse.json(
        { code: 404, message: "家庭不存在" },
        { status: 404 }
      );
    }

    // 处理截止时间
    let deadlineDate = null;
    if (deadline) {
      const [hours, minutes] = deadline.split(":").map(Number);
      deadlineDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      );
      deadlineDate.setHours(hours, minutes, 0, 0);
    }

    // 更新家庭信息
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        is_deadline: is_deadline,
        deadline: deadlineDate,
        integral: integral,
        updated_at: currentTime,
        updated_user_id: currentUserId,
      },
    });

    // 返回更新后的家庭信息
    return NextResponse.json({
      code: 200,
      message: "更新家庭截止时间设置成功",
      data: {
        id: updatedFamily.id,
        name: updatedFamily.name,
        is_deadline: updatedFamily.is_deadline,
        deadline: formatTimeHHMM(updatedFamily.deadline),
        integral: updatedFamily.integral,
      },
    });
  } catch (error) {
    console.error("更新家庭截止时间设置失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新家庭截止时间设置失败", error: error.message },
      { status: 500 }
    );
  }
});
