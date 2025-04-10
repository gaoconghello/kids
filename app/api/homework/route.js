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
    const homeworkDate = searchParams.get("homeworkDate");

    // 构建查询条件
    const where = {};

    // 如果是孩子角色，只能查看自己的作业
    if (request.user.role === "child") {
      where.child_id = request.user.id;
    } else if (request.user.role === "parent") {
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
          { code: 403, message: "无权查看此孩子的作业" },
          { status: 403 }
        );
      }
      where.child_id = parseInt(childId);
    } else {
      return NextResponse.json(
        { code: 403, message: "无法验证家长身份" },
        { status: 403 }
      );
    }

    

    if (subjectId) {
      where.subject_id = parseInt(subjectId);
    }

    // 日期过滤 - 修改为正确的 Prisma 查询条件格式
    if (homeworkDate) {
      // 将 yyyy-mm-dd 格式转换为 Date 对象
      const [year, month, day] = homeworkDate.split("-").map(Number);

      // 创建当天开始和结束的时间点（使用上海时区）
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      // 使用 Prisma 的日期范围查询
      where.homework_date = {
        gte: startDate,
        lte: endDate,
      };
    } else {
      // 如果没有提供日期，查询当天的作业
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();

      const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      where.homework_date = {
        gte: startDate,
        lte: endDate,
      };
    }

    console.log("查询条件:", where);

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
      subject_name: homework.subject?.name,
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
export const PUT = withAuth(["child"], async (request) => {
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

    // 权限检查：孩子只能更新自己的作业
    if (existingHomework.child_id !== request.user.id) {
      return NextResponse.json(
        { code: 403, message: "没有权限更新此作业" },
        { status: 403 }
      );
    }

    // 如果作业已经审核完成，则不能更新
    if (existingHomework.create_review === "1") {
      return NextResponse.json(
        { code: 403, message: "作业已审核完成，不能更新" },
        { status: 403 }
      );
    }

    // 构建更新数据对象
    const updateData = {
      name: data.name,
      subject_id: data.subject_id,
      estimated_duration: parseInt(data.duration) || 0,
      deadline: data.deadline ? (() => {
        const today = new Date();
        const [hours, minutes] = data.deadline.split(':').map(Number);
        // 设置当天的具体时间
        today.setHours(hours, minutes, 0, 0);
        // 转换为上海时区
        return new Date(today.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
      })() : null,
      integral: parseInt(data.integral) || 0,
      updated_at: new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      ),
      updated_user_id: request.user.id
    };

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
export const DELETE = withAuth(["child"], async (request) => {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { code: 400, message: "缺少作业ID" },
        { status: 400 }
      );
    }

    // 检查作业是否存在
    const homework = await prisma.homework.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!homework) {
      return NextResponse.json(
        { code: 404, message: "作业不存在" },
        { status: 404 }
      );
    }

    // 权限检查：只有孩子可以删除自己的作业
    if (homework.child_id !== request.user.id) {
      return NextResponse.json(
        { code: 403, message: "没有权限删除此作业" },
        { status: 403 }
      );
    }

    // 如果已经添加审核完成，则不能删除改作业
    if (homework.create_review === "1") {
      return NextResponse.json(
        { code: 403, message: "作业已审核完成，不能删除" },
        { status: 403 }
      );
    }

    // 删除作业
    await prisma.homework.delete({
      where: { id: parseInt(data.id) },
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
