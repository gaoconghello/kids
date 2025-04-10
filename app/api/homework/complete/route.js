import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { INTEGRAL_TYPE } from "@/lib/constants";

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

    // 检查作业是否已经审核过
    if (existingHomework.complete_review === "1") {
      return NextResponse.json({
        code: 400,
        message: "该作业已经审核过",
        data: {
          id: existingHomework.id,
          name: existingHomework.name,
          subject_id: existingHomework.subject_id,
          estimated_duration: existingHomework.estimated_duration,
          deadline: existingHomework.deadline
            ? formatDateTime(existingHomework.deadline)
            : null,
          integral: existingHomework.integral || 0,
          incorrect: existingHomework.incorrect || 0,
          homework_date: existingHomework.homework_date
            ? formatDateTime(existingHomework.homework_date, "YYYY-MM-DD")
            : null,
          create_review: existingHomework.create_review,
          complete_review: existingHomework.complete_review,
          complete_time: existingHomework.complete_time
            ? formatDateTime(existingHomework.complete_time)
            : null,
          is_complete: existingHomework.is_complete,
          child_id: existingHomework.child_id,
        },
      });
    }

    // 权限检查：家长只能审核同一家庭孩子的作业
    // 获取当前家长和孩子的family_id
    const [parent, child] = await Promise.all([
      prisma.account.findUnique({
        where: { id: request.user.id },
        select: { family_id: true },
      }),
      prisma.account.findUnique({
        where: { id: existingHomework.child_id },
        select: { family_id: true, integral: true },
      }),
    ]);

    if (!parent || !child || parent.family_id !== child.family_id) {
      return NextResponse.json(
        { code: 403, message: "没有权限审核此作业" },
        { status: 403 }
      );
    }

    // 当前上海时间
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    
    let statusCode;
    let statusMessage;
    let updatedHomework;

    if (!data.approved) {
      // 如果approved为false，则将作业状态改为未完成
      updatedHomework = await prisma.homework.update({
        where: { id: parseInt(data.id) },
        data: {
          is_complete: "0",
          updated_at: now,
          updated_user_id: request.user.id,
        },
      });
      statusCode = 400;
      statusMessage = "作业审核未通过";
    } else {
      // 审核通过 - 使用事务处理
      const result = await prisma.$transaction(async (tx) => {
        // 1. 更新作业状态
        const updatedHomework = await tx.homework.update({
          where: { id: parseInt(data.id) },
          data: {
            complete_review: "1",
            complete_review_time: now,
            complete_review_user_id: request.user.id,
            incorrect: data.incorrect ? parseInt(data.incorrect) : 0,
            updated_at: now,
            updated_user_id: request.user.id,
          },
        });
        
        // 2. 更新孩子的积分账户
        let addedIntegral = existingHomework.integral;
        
        // 3. 获取作业所属日期的时间范围（而不是当前日期）
        const homeworkDate = new Date(existingHomework.homework_date);
        const year = homeworkDate.getFullYear();
        const month = homeworkDate.getMonth();
        const day = homeworkDate.getDate();
        
        const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        
        // 4. 检查作业所属日期的所有作业是否都已完成并审核通过
        // 直接获取作业所属日期的所有作业（包括刚刚更新的）
        const todaysHomeworks = await tx.homework.findMany({
          where: {
            child_id: existingHomework.child_id,
            homework_date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });
        
        // 注意：现在我们已经更新了当前作业的状态，所以直接检查所有作业
        // 包括当前已经更新的作业
        const allCompletedAndReviewed = todaysHomeworks.every(
          hw => {
            // 如果是当前作业，使用更新后的状态
            if (hw.id === parseInt(data.id)) {
              return true; // 当前作业已经审核通过
            }
            // 其他作业检查数据库状态
            return hw.is_complete === "1" && hw.complete_review === "1";
          }
        );
        
        // 如果所有作业都已完成并审核通过，检查家庭设置
        if (allCompletedAndReviewed) {
          // 获取家庭设置
          const family = await tx.family.findUnique({
            where: { id: child.family_id },
            select: { is_deadline: true, integral: true, deadline: true },
          });
          
          // 如果家庭设置了deadline奖励
          if (family && family.is_deadline === "1") {
            // 获取当天的deadline时间
            const deadlineTime = family.deadline;
            if (deadlineTime) {
              // 提取小时和分钟
              let hours = 0;
              let minutes = 0;
              
              // 处理不同类型的deadline
              if (typeof deadlineTime === 'string' && deadlineTime.includes(':')) {
                // 字符串格式如 "18:30"
                [hours, minutes] = deadlineTime.split(':').map(Number);
              } else if (deadlineTime instanceof Date) {
                // Date对象
                hours = deadlineTime.getHours();
                minutes = deadlineTime.getMinutes();
              } else if (typeof deadlineTime === 'object' && deadlineTime.hours !== undefined && deadlineTime.minutes !== undefined) {
                // 对象格式如 {hours: 18, minutes: 30}
                hours = deadlineTime.hours;
                minutes = deadlineTime.minutes;
              }
              
              // 创建当天的deadline时间点
              const todayDeadline = new Date(Date.UTC(year, month, day, hours, minutes, 0));
              
              // 检查所有作业的完成时间是否都早于deadline
              const allCompletedBeforeDeadline = todaysHomeworks.every(
                hw => {
                  // 对于当前正在审核的作业，直接使用完成时间
                  if (hw.id === parseInt(data.id)) {
                    return existingHomework.complete_time && new Date(existingHomework.complete_time) < todayDeadline;
                  }
                  // 其他作业检查数据库状态
                  return hw.complete_time && new Date(hw.complete_time) < todayDeadline;
                }
              );
              
              // 如果所有作业都在deadline前完成，添加额外积分
              if (allCompletedBeforeDeadline && family.integral > 0) {
                // 检查是否已经发放过该日期的"完成所有作业"奖励
                const existingIntegralHistory = await tx.integral_history.findFirst({
                  where: {
                    child_id: existingHomework.child_id,
                    integral_type: INTEGRAL_TYPE.FAMILY,
                    integral_date: {
                      gte: startDate,
                      lte: endDate,
                    }
                  }
                });
                
                // 只有在没有发放过奖励的情况下才发放
                if (!existingIntegralHistory) {
                  // 将family.integral添加到总积分中
                  addedIntegral += family.integral;
                  
                  // 创建额外的积分历史记录
                  await tx.integral_history.create({
                    data: {
                      integral_id: 0, // 非特定作业
                      integral_type: INTEGRAL_TYPE.FAMILY,
                      child_id: existingHomework.child_id,
                      family_id: child.family_id,
                      integral: family.integral,
                      integral_date: now,
                      name: "完成所有今日作业",
                    },
                  });
                }
              }
            }
          }
        }
        
        // 更新孩子的积分
        await tx.account.update({
          where: { id: existingHomework.child_id },
          data: {
            integral: child.integral + addedIntegral,
            updated_at: now,
            updated_user_id: request.user.id,
          },
        });
        
        // 5. 创建作业积分历史记录
        await tx.integral_history.create({
          data: {
            integral_id: existingHomework.id,
            integral_type: INTEGRAL_TYPE.HOMEWORK,
            child_id: existingHomework.child_id,
            family_id: child.family_id,
            integral: existingHomework.integral,
            integral_date: now,
            name: "完成" + existingHomework.name,
          },
        });
        
        return updatedHomework;
      });
      
      updatedHomework = result;
      statusCode = 200;
      statusMessage = "作业审核通过";
    }

    // 返回响应
    return NextResponse.json({
      code: statusCode,
      message: statusMessage,
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
        is_complete: updatedHomework.is_complete,
        child_id: updatedHomework.child_id,
      },
    });
  } catch (error) {
    console.error("作业审核失败:", error);
    return NextResponse.json(
      { code: 500, message: "作业审核失败", error: error.message },
      { status: 500 }
    );
  }
});
