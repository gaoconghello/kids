import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取作业列表
export const GET = withAuth(["parent", "child"], async (request) => {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const subjectId = searchParams.get("subjectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 构建查询条件
    const where = {};

    // 如果是孩子角色，只能查看自己的作业
    if (request.user.role === "child") {
      where.child_id = request.user.id;
    } else if (childId) {
      where.child_id = parseInt(childId);
    }

    if (subjectId) {
      where.subject_id = parseInt(subjectId);
    }

    // 日期范围过滤
    if (startDate || endDate) {
      where.homework_date = {};

      if (startDate) {
        where.homework_date.gte = new Date(startDate);
      }

      if (endDate) {
        where.homework_date.lte = new Date(endDate);
      }
    }

    // 查询数据库
    const homeworks = await prisma.homework.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      include: {
        subject: true,
      },
    });

    // 格式化数据
    const formattedHomeworks = homeworks.map((homework) => ({
      id: homework.id,
      name: homework.name,
      subject_id: homework.subject_id,
      subject_name: homework.subject.name,
      estimated_duration: homework.estimated_duration,
      deadline: homework.deadline ? formatDateTime(homework.deadline) : null,
      integral: homework.integral || 0,
      incorrect: homework.incorrect || 0,
      homework_date: homework.homework_date
        ? formatDateTime(homework.homework_date, "YYYY-MM-DD")
        : null,
      create_review: homework.create_review,
      complete_review: homework.complete_review,
      create_review_time: homework.create_review_time
        ? formatDateTime(homework.create_review_time)
        : null,
      complete_review_time: homework.complete_review_time
        ? formatDateTime(homework.complete_review_time)
        : null,
      complete_time: homework.complete_time
        ? formatDateTime(homework.complete_time)
        : null,
      pomodoro: homework.pomodoro,
      is_complete: homework.is_complete,
      child_id: homework.child_id,
      created_at: homework.created_at
        ? formatDateTime(homework.created_at)
        : null,
      updated_at: homework.updated_at
        ? formatDateTime(homework.updated_at)
        : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取作业列表成功",
      data: formattedHomeworks,
    });
  } catch (error) {
    console.error("获取作业列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取作业列表失败", error: error.message },
      { status: 500 }
    );
  }
});

// 创建新作业
export const POST = withAuth(["parent", "child"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.name) {
      return NextResponse.json(
        { code: 400, message: "缺少必要字段" },
        { status: 400 }
      );
    }

    console.log(data);
    data.child_id = request.user.id;

    // 创建新作业
    const newHomework = await prisma.homework.create({
      data: {
        name: data.name,
        subject_id: data.subject_id ? parseInt(data.subject_id) : null,
        estimated_duration: data.estimated_duration
          ? parseInt(data.estimated_duration)
          : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        integral: data.integral ? parseInt(data.integral) : 0,
        incorrect: data.incorrect ? parseInt(data.incorrect) : 0,
        homework_date: new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        ),
        create_review: "0",
        complete_review: "0",
        create_review_time: null,
        create_review_user_id: null,
        complete_review_time: null,
        complete_review_user_id: null,
        complete_time: null,
        is_complete: "0",
        pomodoro: data.pomodoro ? parseInt(data.pomodoro) : null,

        child_id: request.user.id,

        created_at: new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        ),
        updated_at: new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        ),
        created_user_id: request.user.id,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "作业添加成功",
      data: {
        id: newHomework.id,
        name: newHomework.name,
        subject_id: newHomework.subject_id,
        estimated_duration: newHomework.estimated_duration,
        deadline: newHomework.deadline
          ? formatDateTime(newHomework.deadline)
          : null,
        integral: newHomework.integral || 0,
        incorrect: newHomework.incorrect || 0,
        homework_date: newHomework.homework_date
          ? formatDateTime(newHomework.homework_date, "YYYY-MM-DD")
          : null,
        create_review: newHomework.create_review,
        complete_review: newHomework.complete_review,
        is_complete: newHomework.is_complete,
        child_id: newHomework.child_id,
      },
    });
  } catch (error) {
    console.error("添加作业失败:", error);
    return NextResponse.json(
      { code: 500, message: "添加作业失败", error: error.message },
      { status: 500 }
    );
  }
});

// 更新作业信息
export const PUT = withAuth(["parent", "child"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.id) {
      return NextResponse.json(
        { code: 400, message: "缺少作业ID" },
        { status: 400 }
      );
    }

    // 检查作业是否存在
    const existingHomework = await prisma.homework.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!existingHomework) {
      return NextResponse.json(
        { code: 404, message: "作业不存在" },
        { status: 404 }
      );
    }

    // 权限检查：孩子只能更新自己的作业完成状态
    if (
      request.user.role === "child" &&
      existingHomework.child_id !== request.user.id
    ) {
      return NextResponse.json(
        { code: 403, message: "没有权限更新此作业" },
        { status: 403 }
      );
    }

    // 构建更新数据
    const updateData = {};

    // 孩子只能更新完成状态相关字段
    if (request.user.role === "child") {
      // 如果是孩子提交完成
      if (data.complete_status === "completed") {
        updateData.complete_time = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        );
        // 等待家长审核
        updateData.complete_review = "0";
      }
    } else {
      // 家长或管理员可以更新所有字段
      if (data.name) updateData.name = data.name;
      if (data.subject_id !== undefined)
        updateData.subject_id = data.subject_id
          ? parseInt(data.subject_id)
          : null;
      if (data.estimated_duration !== undefined)
        updateData.estimated_duration = data.estimated_duration
          ? parseInt(data.estimated_duration)
          : null;
      if (data.deadline !== undefined)
        updateData.deadline = data.deadline ? new Date(data.deadline) : null;
      if (data.integral !== undefined)
        updateData.integral = parseInt(data.integral);
      if (data.incorrect !== undefined)
        updateData.incorrect = parseInt(data.incorrect);
      if (data.homework_date !== undefined)
        updateData.homework_date = data.homework_date
          ? new Date(data.homework_date)
          : null;

      // 家长审核完成
      if (data.complete_review) {
        updateData.complete_review = data.complete_review;
        updateData.complete_review_time = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
        );
        updateData.complete_review_user_id = request.user.id;
      }
    }

    // 通用更新字段
    updateData.updated_at = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    updateData.updated_user_id = request.user.id;

    // 更新作业信息
    const updatedHomework = await prisma.homework.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });

    return NextResponse.json({
      code: 200,
      message: "作业信息更新成功",
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
      },
    });
  } catch (error) {
    console.error("更新作业信息失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新作业信息失败", error: error.message },
      { status: 500 }
    );
  }
});

// 删除作业
export const DELETE = withAuth(["parent", "child"], async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { code: 400, message: "缺少作业ID" },
        { status: 400 }
      );
    }

    // 检查作业是否存在
    const homework = await prisma.homework.findUnique({
      where: { id: parseInt(id) },
    });

    if (!homework) {
      return NextResponse.json(
        { code: 404, message: "作业不存在" },
        { status: 404 }
      );
    }

    // 删除作业
    await prisma.homework.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      code: 200,
      message: "作业删除成功",
    });
  } catch (error) {
    console.error("删除作业失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除作业失败", error: error.message },
      { status: 500 }
    );
  }
});
