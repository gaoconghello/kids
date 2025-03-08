import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

// 获取所有学科记录
export const GET = withAuth([], async (request) => {
  try {
    // 查询数据库获取所有学科记录
    const subjects = await prisma.subject.findMany({
      orderBy: {
        id: "asc",
      },
    });

    // 格式化数据，只返回id和name
    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
    }));

    return NextResponse.json({
      code: 200,
      message: "获取学科列表成功",
      data: formattedSubjects,
    });
  } catch (error) {
    console.error("获取学科列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取学科列表失败", error: error.message },
      { status: 500 }
    );
  }
});
