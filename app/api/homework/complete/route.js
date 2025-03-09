import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

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

// 获取已完成作业列表
export const GET = withAuth(["child"], async (request) => {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const subjectId = searchParams.get("subjectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reviewStatus = searchParams.get("reviewStatus"); // 审核状态：pending, approved, rejected

    // 构建查询条件
    const where = {
      is_complete: "1", // 只查询已完成的作业
    };

    // 如果是孩子角色，只能查看自己的作业
    if (request.user.role === "child") {
      where.child_id = request.user.id;
    } else if (childId) {
      where.child_id = parseInt(childId);
    }

    if (subjectId) {
      where.subject_id = parseInt(subjectId);
    }

    // 审核状态过滤
    if (reviewStatus) {
      switch (reviewStatus) {
        case "pending":
          where.complete_review = "0";
          break;
        case "approved":
          where.complete_review = "1";
          break;
        case "rejected":
          where.complete_review = "2";
          break;
      }
    }

    // 日期范围过滤
    if (startDate || endDate) {
      where.complete_time = {};

      if (startDate) {
        where.complete_time.gte = new Date(startDate);
      }

      if (endDate) {
        where.complete_time.lte = new Date(endDate);
      }
    }

    // 查询数据库
    const completedHomeworks = await prisma.homework.findMany({
      where,
      orderBy: {
        complete_time: "desc",
      },
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

    // 格式化数据
    const formattedHomeworks = completedHomeworks.map((homework) => ({
      id: homework.id,
      name: homework.name,
      subject_id: homework.subject_id,
      subject_name: homework.subject?.name || "",
      estimated_duration: homework.estimated_duration,
      deadline: homework.deadline ? formatDateTime(homework.deadline) : null,
      integral: homework.integral || 0,
      incorrect: homework.incorrect || 0,
      homework_date: homework.homework_date
        ? formatDateTime(homework.homework_date, "YYYY-MM-DD")
        : null,
      complete_time: formatDateTime(homework.complete_time),
      complete_review: homework.complete_review,
      complete_review_time: homework.complete_review_time
        ? formatDateTime(homework.complete_review_time)
        : null,
      child_id: homework.child_id,
      child_name: homework.child?.name || "",
      created_at: homework.created_at
        ? formatDateTime(homework.created_at)
        : null,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取已完成作业列表成功",
      data: formattedHomeworks,
    });
  } catch (error) {
    console.error("获取已完成作业列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取已完成作业列表失败", error: error.message },
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
