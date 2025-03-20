import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取待审核的已完成作业
// 获取作业列表(添加待审核作业)
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const homeworkDate = searchParams.get("homeworkDate");

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

    // 构建查询条件，只查询已经完成但是没有审核的作业
    const where = {
      is_complete: "1", // 只查询已完成作业
      complete_review: "0", // 只查询待审核作业
      child_id: parseInt(childId),
    };

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
      const now = new Date();
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

// 完成作业API
export const POST = withAuth(["child"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.homeworkId) {
      return NextResponse.json(
        { code: 400, message: "缺少作业ID" },
        { status: 400 }
      );
    }

    const homeworkId = parseInt(data.homeworkId);

    // 使用事务来确保数据一致性
    return await prisma.$transaction(async (tx) => {
      // 检查作业是否存在
      const homework = await tx.homework.findUnique({
        where: { id: homeworkId },
        include: {},
      });

      if (!homework) {
        return NextResponse.json(
          { code: 404, message: "作业不存在" },
          { status: 404 }
        );
      }

      // 检查是否是自己的作业
      if (homework.child_id !== request.user.id) {
        return NextResponse.json(
          { code: 403, message: "没有权限完成此作业" },
          { status: 403 }
        );
      }

      // 检查作业是否已经完成
      if (homework.is_complete === "1") {
        return NextResponse.json(
          { code: 400, message: "该作业已经完成" },
          { status: 400 }
        );
      }

      // 获取当前时间（上海时区）
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      );

      // 更新作业状态
      const updatedHomework = await tx.homework.update({
        where: { id: homeworkId },
        data: {
          complete_time: now,
          is_complete: "1",
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
          integral: account.integral + homework.integral,
          updated_at: now,
          updated_user_id: request.user.id,
        },
      });

      // 创建积分历史记录
      await tx.integral_history.create({
        data: {
          integral_id: homeworkId,
          integral_type: "1", // 1表示作业
          child_id: request.user.id,
          family_id: account.family_id, // 从账户中获取家庭ID
        },
      });

      return NextResponse.json({
        code: 200,
        message: "作业完成成功",
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
          is_complete: updatedHomework.is_complete,
          child_id: updatedHomework.child_id,
        },
      });
    });
  } catch (error) {
    console.error("完成作业失败:", error);
    return NextResponse.json(
      { code: 500, message: "完成作业失败", error: error.message },
      { status: 500 }
    );
  }
});

// 审核已完成作业
export const PUT = withAuth(["parent"], async (request) => {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.homeworkId || !data.reviewStatus) {
      return NextResponse.json(
        { code: 400, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    const homeworkId = parseInt(data.homeworkId);
    const reviewStatus = data.reviewStatus; // "1" 为通过, "2" 为拒绝

    // 检查作业是否存在
    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        subject: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!homework) {
      return NextResponse.json(
        { code: 404, message: "作业不存在" },
        { status: 404 }
      );
    }

    // 检查作业是否已完成
    if (!homework.complete_time) {
      return NextResponse.json(
        { code: 400, message: "该作业尚未完成，无法审核" },
        { status: 400 }
      );
    }

    // 获取当前时间（上海时区）
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );

    // 更新作业审核状态
    const updatedHomework = await prisma.homework.update({
      where: { id: homeworkId },
      data: {
        complete_review: reviewStatus,
        complete_review_time: now,
        complete_review_user_id: request.user.id,
        updated_at: now,
        updated_user_id: request.user.id,
        review_comment: data.comment || null,
      },
    });

    // 如果审核拒绝，需要撤销之前的积分奖励
    if (reviewStatus === "2") {
      // 查找之前的积分记录
      const previousIntegral = await prisma.integral.findFirst({
        where: {
          source: "homework",
          source_id: homeworkId,
          type: "income",
        },
      });

      if (previousIntegral) {
        // 创建积分撤销记录
        await prisma.integral.create({
          data: {
            child_id: homework.child_id,
            amount: -previousIntegral.amount, // 负值表示扣除
            type: "expense",
            source: "homework_rejected",
            source_id: homeworkId,
            description: `作业《${homework.name}》审核未通过，撤销积分`,
            created_at: now,
            updated_at: now,
            created_user_id: request.user.id,
          },
        });
      }
    }

    return NextResponse.json({
      code: 200,
      message: reviewStatus === "1" ? "作业审核通过" : "作业审核未通过",
      data: {
        id: updatedHomework.id,
        name: updatedHomework.name,
        subject_name: homework.subject?.name || "",
        complete_review: updatedHomework.complete_review,
        complete_review_time: formatDateTime(
          updatedHomework.complete_review_time
        ),
        child_name: homework.child?.name || "",
        review_comment: updatedHomework.review_comment,
      },
    });
  } catch (error) {
    console.error("审核作业失败:", error);
    return NextResponse.json(
      { code: 500, message: "审核作业失败", error: error.message },
      { status: 500 }
    );
  }
});
