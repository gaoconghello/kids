import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 处理POST请求 - 记录番茄钟学习时间并奖励积分
export const POST = withAuth(["parent", "child"], async (request) => {
  try {
    const userId = request.user.id;
    const { homeworkId } = await request.json();

    // 查询当前用户
    const user = await prisma.account.findUnique({
      where: { id: userId },
    });

    // 检查作业是否存在
    const existingHomework = await prisma.homework.findUnique({
      where: { id: parseInt(homeworkId) },
    });

    if (!existingHomework) {
      return NextResponse.json({ error: "作业不存在" }, { status: 404 });
    }

    // 权限检查：只有作业所有者才能更新自己的作业
    if (existingHomework.child_id !== userId) {
      return NextResponse.json(
        { error: "没有权限更新此作业" },
        { status: 403 }
      );
    }

    // 更新user的integral + 5
    await prisma.account.update({
      where: { id: userId },
      data: {
        integral: (user.integral || 0) + 5,
      },
    });

    // 更新作业的番茄钟计数和积分
    const updatedHomework = await prisma.homework.update({
      where: { id: parseInt(homeworkId) },
      data: {
        pomodoro: (existingHomework.pomodoro || 0) + 1,
        updated_at: new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        ),
        updated_user_id: userId,
      },
    });

    // 更新积分历史
    await prisma.integral_history.create({
      data: {
        child_id: userId,
        integral_id: parseInt(homeworkId),
        integral_type: "01",
        family_id: existingHomework.family_id,
        integral: 5,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "番茄更新成功",
      data: {
        id: updatedHomework.id,
        name: updatedHomework.name,
        subject_id: updatedHomework.subject_id,
        estimated_duration: updatedHomework.estimated_duration,
        deadline: updatedHomework.deadline
          ? formatDateTime(updatedHomework.deadline)
          : null,
        integral: updatedHomework.integral || 0,
        incorrect: updatedHomework.incorrect || 0,
        homework_date: updatedHomework.homework_date
          ? formatDateTime(updatedHomework.homework_date, "YYYY-MM-DD")
          : null,
        create_review: updatedHomework.create_review,
        complete_review: updatedHomework.complete_review,
        complete_time: updatedHomework.complete_time
          ? formatDateTime(updatedHomework.complete_time)
          : null,
        child_id: updatedHomework.child_id,
        pomodoro: updatedHomework.pomodoro || 0,
      },
    });
  } catch (error) {
    console.error("番茄钟API错误:", error);
    return NextResponse.json(
      { error: "处理番茄钟记录时出错" },
      { status: 500 }
    );
  }
});
