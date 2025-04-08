import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取任务列表
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

// 创建新任务
export const POST = withAuth(["parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.name) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段" },
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
      where: { id: parseInt(data.child_id) },
      select: { family_id: true },
    });

    if (!child || child.family_id !== parent.family_id) {
      return NextResponse.json(
        { code: 403, message: "无权为此孩子添加作业" },
        { status: 403 }
      );
    }

    // 创建新任务
    const newTask = await prisma.task.create({
      data: {
        name: data.name,
        integral: data.integral ? parseInt(data.integral) : 0,
        child_id: data.child_id,
        task_date: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        create_review: "1",
        complete_review: "0",
        created_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        updated_at: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })),
        created_user_id: request.user.id,
        updated_user_id: request.user.id,
        is_complete: "0",
      },
    });

    return NextResponse.json({
      code: 200,
      message: "任务添加成功",
      data: {
        id: newTask.id,
        name: newTask.name,
        integral: newTask.integral || 0,
        child_id: newTask.child_id,
        task_date: formatDateTime(newTask.task_date),
        create_review: newTask.create_review,
        complete_review: newTask.complete_review,
        create_review_time: formatDateTime(newTask.create_review_time),
        created_at: formatDateTime(newTask.created_at),
      },
    });
  } catch (error) {
    console.error("添加任务失败:", error);
    return NextResponse.json(
      { code: 500, message: "添加任务失败", error: error.message },
      { status: 500 }
    );
  }
});

// 更新任务信息
export const PUT = withAuth(["admin", "parent", "child"], async (request) => {
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

    // 权限检查：孩子只能更新自己的任务完成状态
    if (request.user.role === "child" && existingTask.child_id !== request.user.id) {
      return NextResponse.json(
        { code: 403, message: "没有权限更新此任务" },
        { status: 403 }
      );
    }

    // 构建更新数据
    const updateData = {};
    
    // 孩子只能更新完成状态相关字段
    if (request.user.role === "child") {
      // 如果是孩子提交完成
      if (data.complete_status === "completed") {
        updateData.complete_time = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
        // 等待家长审核
        updateData.complete_review = "N";
      }
    } else {
      // 家长或管理员可以更新所有字段
      if (data.name) updateData.name = data.name;
      if (data.integral !== undefined) updateData.integral = parseInt(data.integral);
      
      // 家长审核完成
      if (data.complete_review) {
        updateData.complete_review = data.complete_review;
        updateData.complete_review_time = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
        updateData.complete_review_user_id = request.user.id;
      }
    }

    // 通用更新字段
    updateData.updated_at = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    updateData.updated_user_id = request.user.id;

    // 更新任务信息
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });

    return NextResponse.json({
      code: 200,
      message: "任务信息更新成功",
      data: {
        id: updatedTask.id,
        name: updatedTask.name,
        integral: updatedTask.integral || 0,
        child_id: updatedTask.child_id,
        create_review: updatedTask.create_review,
        complete_review: updatedTask.complete_review,
        complete_time: updatedTask.complete_time ? formatDateTime(updatedTask.complete_time) : null,
        create_review_time: updatedTask.create_review_time ? formatDateTime(updatedTask.create_review_time) : null,
        complete_review_time: updatedTask.complete_review_time ? formatDateTime(updatedTask.complete_review_time) : null,
      },
    });
  } catch (error) {
    console.error("更新任务信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新任务信息失败", error: error.message },
      { status: 500 }
    );
  }
});

// 删除任务
export const DELETE = withAuth(["admin", "parent"], async (request) => {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { code: 400, message: "缺少任务ID" },
        { status: 400 }
      );
    }

    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!task) {
      return NextResponse.json(
        { code: 404, message: "任务不存在" },
        { status: 404 }
      );
    }

    // 权限检查：家长的family_id必须与任务的child_id的family_id相同
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
      where: { id: parseInt(task.child_id) },
      select: { family_id: true },
    });

    if (!child || child.family_id !== parent.family_id) {
      return NextResponse.json(
        { code: 403, message: "无权删除此任务" },
        { status: 403 }
      );
    } 
    
    // 删除任务
    await prisma.task.delete({
      where: { id: parseInt(data.id) },
    });

    return NextResponse.json({
      code: 200,
      message: "任务删除成功",
    });
  } catch (error) {
    console.error("删除任务失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除任务失败", error: error.message },
      { status: 500 }
    );
  }
});
