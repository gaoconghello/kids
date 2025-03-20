import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 完成任务API
export const POST = withAuth(["child"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.taskId) {
      return NextResponse.json(
        { code: 400, message: "缺少任务ID" },
        { status: 400 }
      );
    }

    const childId = request.user.id;

    const taskId = parseInt(data.taskId);

    // 使用事务来确保数据一致性
    return await prisma.$transaction(async (tx) => {
      // 检查作业是否存在
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: {},
      });

      if (!task) {
        return NextResponse.json(
          { code: 404, message: "任务不存在" },
          { status: 404 }
        );
      }

      // 检查是否是自己的任务
      if (task.child_id !== childId) {
        return NextResponse.json(
          { code: 403, message: "没有权限完成此任务" },
          { status: 403 }
        );
      }

      // 检查作业是否已经完成
      if (task.complete_time) {
        return NextResponse.json(
          { code: 400, message: "该任务已经完成" },
          { status: 400 }
        );
      }

      // 获取当前时间（上海时区）
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      );

      // 更新任务状态
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          complete_time: now,
          complete_review: "0", // 等待家长审核
          updated_at: now,
          updated_user_id: request.user.id,
        },
      });

      // 查询账户
      const account = await tx.account.findUnique({
        where: {
          id: request.user.id,
        },
      });

      if (!account) {
        return NextResponse.json(
          { code: 404, message: "账户不存在" },
          { status: 404 }
        );
      }

      // 更新账户积分
      await tx.account.update({
        where: { id: account.id },
        data: {
          integral: account.integral + task.integral,
          updated_at: now,
          updated_user_id: request.user.id,
        },
      });

      // 创建积分历史记录
      await tx.integral_history.create({
        data: {
          integral_id: taskId,
          integral_type: "2", // 1表示任务
          child_id: request.user.id,
          family_id: account.family_id, // 从账户中获取家庭ID
        },
      });

      return NextResponse.json({
        code: 200,
        message: "任务完成成功",
        data: {
          id: updatedTask.id,
          name: updatedTask.name,
          integral: updatedTask.integral || 0,
          task_date: updatedTask.task_date
            ? formatDateTime(updatedTask.task_date, "YYYY-MM-DD")
            : null,
          complete_time: updatedTask.complete_time
            ? formatDateTime(updatedTask.complete_time)
            : null,
          complete_review: updatedTask.complete_review,
          complete_review_time: updatedTask.complete_review_time
            ? formatDateTime(updatedTask.complete_review_time)
            : null,
          child_id: updatedTask.child_id,
        },
      });
    });
  } catch (error) {
    console.error("完成任务失败:", error);
    return NextResponse.json(
      { code: 500, message: "完成任务失败", error: error.message },
      { status: 500 }
    );
  }
});
