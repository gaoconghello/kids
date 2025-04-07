import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { INTEGRAL_TYPE } from "@/lib/constants";

// 获取完成任务列表
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const taskDate = searchParams.get("taskDate");

    // 构建查询条件
    const where = {};
    
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
        { code: 403, message: "无权查看此孩子的任务" },
        { status: 403 }
      );
    }
    
    where.child_id = parseInt(childId);
    where.is_complete = "1";
    where.complete_review = "0";

    // 日期过滤
    if (taskDate) {
      // 将 yyyy-mm-dd 格式转换为 Date 对象
      const [year, month, day] = taskDate.split('-').map(Number);
      
      // 创建当天开始和结束的时间点（使用上海时区）
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      
      // 使用 Prisma 的日期范围查询
      where.task_date = {
        gte: startDate,
        lte: endDate
      };
    } else {
      // 如果没有提供日期，查询当天的任务
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      
      const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      
      where.task_date = {
        gte: startDate,
        lte: endDate
      };
    }

    console.log("查询条件:", where);

    // 查询数据库
    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        created_at: "desc",
      }
    });

    // 格式化数据
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      integral: task.integral || 0,
      child_id: task.child_id,
      task_date: task.task_date ? formatDateTime(task.task_date) : null,
      create_review: task.create_review,
      complete_review: task.complete_review,
      create_review_time: task.create_review_time ? formatDateTime(task.create_review_time) : null,
      complete_review_time: task.complete_review_time ? formatDateTime(task.complete_review_time) : null,
      complete_time: task.complete_time ? formatDateTime(task.complete_time) : null,
      is_complete: task.is_complete,
      created_at: task.created_at ? formatDateTime(task.created_at) : null,
      updated_at: task.updated_at ? formatDateTime(task.updated_at) : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取任务列表成功",
      data: formattedTasks,
    });
  } catch (error) {
    console.error("获取任务列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取任务列表失败", error: error.message },
      { status: 500 }
    );
  }
});

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

    // 检查作业是否存在
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
    if (task.is_complete === "1") {
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
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        is_complete: "1",
        complete_time: now,
        complete_review: "0", // 等待家长审核
        updated_at: now,
        updated_user_id: request.user.id,
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
  } catch (error) {
    console.error("完成任务失败:", error);
    return NextResponse.json(
      { code: 500, message: "完成任务失败", error: error.message },
      { status: 500 }
    );
  }
});

// 审核任务信息
export const PUT = withAuth(["parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.id) {
      return NextResponse.json(
        { code: 400, message: "缺少任务ID" },
        { status: 400 }
      );
    }

    // 检查任务是否存在
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!existingTask) {
      return NextResponse.json(
        { code: 404, message: "任务不存在" },
        { status: 404 }
      );
    }

    // 权限检查：家长只能审核同一家庭孩子的任务
    // 获取当前家长和孩子的family_id
    const [parent, child] = await Promise.all([
      prisma.account.findUnique({
        where: { id: request.user.id },
        select: { family_id: true },
      }),
      prisma.account.findUnique({
        where: { id: existingTask.child_id },
        select: { family_id: true, integral: true },
      }),
    ]);

    if (!parent || !child || parent.family_id !== child.family_id) {
      return NextResponse.json(
        { code: 403, message: "没有权限审核此任务" },
        { status: 403 }
      );
    }

    // 当前上海时间
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    
    let statusCode;
    let statusMessage;
    let updatedTask;

    if (!data.approved) {
      // 如果approved为false，则将任务状态改为未完成
      updatedTask = await prisma.task.update({
        where: { id: parseInt(data.id) },
        data: {
          is_complete: "0",
          updated_at: now,
          updated_user_id: request.user.id,
        },
      });
      statusCode = 400;
      statusMessage = "任务审核未通过";
    } else {
      // 审核通过 - 使用事务处理
      const result = await prisma.$transaction(async (tx) => {
        // 1. 更新任务状态
        const updatedTask = await tx.task.update({
          where: { id: parseInt(data.id) },
          data: {
            complete_review: "1",
            complete_review_time: now,
            complete_review_user_id: request.user.id,
            updated_at: now,
            updated_user_id: request.user.id,
          },
        });
        
        // 2. 更新孩子的积分账户
        await tx.account.update({
          where: { id: existingTask.child_id },
          data: {
            integral: child.integral + existingTask.integral,
            updated_at: now,
            updated_user_id: request.user.id,
          },
        });
        
        // 3. 创建积分历史记录
        await tx.integral_history.create({
          data: {
            integral_id: existingTask.id,
            integral_type: INTEGRAL_TYPE.TASK,
            child_id: existingTask.child_id,
            family_id: child.family_id,
            integral: existingTask.integral,
            integral_date: now,
            name: "完成" + existingTask.name,
          },
        });
        
        return updatedTask;
      });
      
      updatedTask = result;
      statusCode = 200;
      statusMessage = "任务审核通过";
    }

    // 返回响应
    return NextResponse.json({
      code: statusCode,
      message: statusMessage,
      data: {
        id: updatedTask.id,
        name: updatedTask.name,
        integral: updatedTask.integral || 0,
        child_id: updatedTask.child_id,
        task_date: updatedTask.task_date
          ? formatDateTime(updatedTask.task_date)
          : null,
        create_review: updatedTask.create_review,
        complete_review: updatedTask.complete_review,
        create_review_time: updatedTask.create_review_time
          ? formatDateTime(updatedTask.create_review_time)
          : null,
        complete_review_time: updatedTask.complete_review_time
          ? formatDateTime(updatedTask.complete_review_time)
          : null,
        complete_time: updatedTask.complete_time
          ? formatDateTime(updatedTask.complete_time)
          : null,
        is_complete: updatedTask.is_complete,
      },
    });
  } catch (error) {
    console.error("任务审核失败:", error);
    return NextResponse.json(
      { code: 500, message: "任务审核失败", error: error.message },
      { status: 500 }
    );
  }
});