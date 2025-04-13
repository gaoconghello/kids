import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import invokeLlm from "@/lib/llm_openrouter";

export const maxDuration = 60;

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

    // 检查是否存在缓存
    const cache = await prisma.analysis_cache.findFirst({
      where: {
        child_id: parseInt(childId),
        date: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })),
        last_days: parseInt(lastDays),
      },
    });

    if (cache) {
      return NextResponse.json({
        code: 200,
        message: "获取作业分析成功",
        data: {
          analysis: JSON.parse(cache.content),
        },
      });
    }

    where.child_id = parseInt(childId);

    // 查询从当前天到lastDays天前的作业
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const startDate = new Date(
      Date.UTC(year, month, day - parseInt(lastDays), 0, 0, 0)
    );
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
        name: homework.subject?.name,
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

    // 按照作业日期分组数据
    const homeworkByDate = {};
    formattedHomeworks.forEach((item) => {
      const date = item.homeworkDate;
      if (!homeworkByDate[date]) {
        homeworkByDate[date] = [];
      }
      homeworkByDate[date].push(item);
    });

    // 按日期排序（降序）
    const sortedDates = Object.keys(homeworkByDate).sort().reverse();

    // 输出格式化文本
    let formattedHomeworkReport = "";
    sortedDates.forEach((date) => {
      formattedHomeworkReport += `${date} 作业情况：\n`;

      homeworkByDate[date].forEach((item) => {
        let line = `- ${item.subject.name}作业《${item.title}》，预计时长${item.estimatedDuration}分钟，`;

        if (item.isComplete) {
          line += `完成于${item.completionDate} ${item.completionTime}，错误${item.wrongAnswers}题，已完成`;
          if (item.pomodoro && item.pomodoro > 0) {
            line += `，使用${item.pomodoro}个番茄钟`;
          }
        } else {
          line += `未完成`;
        }

        line += "。\n";
        formattedHomeworkReport += line;
      });

      formattedHomeworkReport += "\n";
    });

    // 构建LLM提示词
    const prompt = `
你是一个教育分析助手，请根据以下格式化的作业数据，对小学生的作业情况进行智能分析。

分析内容包括以下三部分，请使用如下JSON结构格式化输出, 不要输出其他内容,仅仅输出json内容：
{
  "subjectAnalysis": [
    {
      "subject": "语文",
      "completedCount": 8,
      "wrongCount": 5,
      "incompleteCount": 3,
      "comment": "语文作业量最大，存在未完成情况，需关注任务类型及时间安排。"
    },
    ...
  ],
  "timeAndEfficiency": {
    "studyTimePeak": "19:00-22:30",
    "earlyMorningCompletion": true,
    "pomodoroUsed": 1,
    "comment": "晚间是主要学习时间，有早起补作业现象，番茄钟使用次数较少，可引导增加。"
  },
  "suggestions": [
    "语文作业可适当提前安排，避免晚间或早起赶作业。",
    "英语作业错题较多，建议复盘错题类型，侧重拼写和阅读题。",
    "鼓励合理规划每日作业顺序与时间，提高效率和完成度。",
    "引导孩子在难度较大的任务中使用番茄钟提升专注力。",
    "对未完成任务进行适当回顾，识别拖延或情绪因素。"
  ]
}

下面是作业数据（data）：
${formattedHomeworkReport}
`;

    console.log("LLM提示词:", prompt);

    // 调用LLM获取分析结果
    const analysisResult = await invokeLlm({
      content: prompt,
      systemPrompt:
        "你是一个教育分析助手，请根据以下格式化的作业数据，对小学生的作业情况进行智能分析。",
      modelName: "google/gemini-2.5-pro-exp-03-25:free",
      stream: false,
      temperature: 0.1,
    });

    console.log("LLM返回的结果:", analysisResult);

    // 解析LLM返回的JSON结果
    let analysisJson;
    try {
      // 移除可能存在的Markdown代码块标记
      let cleanResult = analysisResult;
      if (cleanResult.startsWith("```json")) {
        cleanResult = cleanResult
          .replace(/^```json\n/, "")
          .replace(/\n```$/, "");
      } else if (cleanResult.startsWith("```")) {
        cleanResult = cleanResult.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      console.log("LLM返回的JSON结果:", cleanResult);

      analysisJson = JSON.parse(cleanResult);
    } catch (error) {
      console.error("解析LLM返回的JSON失败:", error);
      // 如果解析失败，返回原始结果
      analysisJson = { rawResult: analysisResult };
    }

    // 缓存分析结果
    await prisma.analysis_cache.create({
      data: {
        child_id: parseInt(childId),
        date: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })),
        last_days: parseInt(lastDays),
        content: JSON.stringify(analysisJson),
        created_at: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })),
        updated_at: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })),
      },
    });

    return NextResponse.json({
      code: 200,
      message: "获取作业分析成功",
      data: {
        analysis: analysisJson,
      },
    });
  } catch (error) {
    console.error("获取作业分析失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取作业分析失败", error: error.message },
      { status: 500 }
    );
  }
});
