import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取作业列表
export const GET = withAuth(["parent"], async (request) => {
  try {
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const lastDays = searchParams.get("lastDays");

    // 构建查询条件
    const where = {};

    // 如果没有提供childId，直接返回空数据
    if (!childId) {
      return NextResponse.json(
        {
          code: 400,
          message: "缺少必要参数childId",
        },
        { status: 400 }
      );
    }

    if (!lastDays) {
      return NextResponse.json(
        { code: 400, message: "缺少必要参数lastDays" },
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


    // 查询从当前天到lastDays天前的作业
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const startDate = new Date(Date.UTC(year, month, day - parseInt(lastDays), 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    where.homework_date = {
      gte: startDate,
      lte: endDate,
    };

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
      title: homework.name,
      subject: {
        id: homework.subject_id,
        name: homework.subject?.name
      },
      homeworkDate: homework.homework_date
        ? formatDateTime(homework.homework_date, "YYYY-MM-DD")
        : null,
      completionDate: homework.complete_time 
        ? formatDateTime(homework.complete_time, "YYYY-MM-DD")
        : null,
      completionTime: homework.complete_time
        ? formatDateTime(homework.complete_time, "HH:mm")
        : null,
      wrongAnswers: homework.incorrect || 0,
      estimatedDuration: homework.estimated_duration,
      isComplete: homework.is_complete === "1" ? true : false,
      pomodoro: homework.pomodoro,
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
