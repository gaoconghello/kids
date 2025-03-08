"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Gift,
  Award,
  BookOpen,
  Calendar,
  History,
  ShoppingBag,
  ChevronRight,
  Check,
  Plus,
  Sparkles,
  Clock,
  PenLine,
  LogOut,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddHomeworkDialog } from "./add-homework-dialog";
import { PomodoroTimer } from "./pomodoro-timer";
import { ConfettiCelebration } from "./confetti-celebration";
import { createTaskConfetti } from "./task-confetti";
import { AddTaskDialog } from "./add-task-dialog";
import { TaskCalendar } from "./task-calendar";
import { ChangePasswordDialog } from "./change-password-dialog";
import { useAuth } from "@/app/providers/AuthProvider";

// 庆祝组件
function CompletionCelebration({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="p-8 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-3xl font-bold text-green-600">
          恭喜你完成了所有作业！
        </h2>
        <p className="mb-6 text-gray-700">奖励 +50 积分已到账！</p>
        <Button
          onClick={onClose}
          className="text-white bg-green-500 hover:bg-green-700"
        >
          关闭
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [points, setPoints] = useState(350);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "完成数学作业",
      points: 20,
      completed: false,
      time: "今天",
    },
    { id: 2, title: "阅读30分钟", points: 15, completed: false, time: "今天" },
    { id: 3, title: "整理玩具", points: 10, completed: false, time: "今天" },
    { id: 4, title: "帮妈妈洗碗", points: 25, completed: false, time: "今天" },
  ]);

  const [rewards, setRewards] = useState([
    {
      id: 1,
      title: "看30分钟动画片",
      points: 50,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      title: "冰淇淋一个",
      points: 100,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      title: "玩具小车",
      points: 200,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      title: "游乐场门票",
      points: 500,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 5,
      title: "新故事书一本",
      points: 150,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 6,
      title: "画画套装",
      points: 300,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 7,
      title: "积木玩具",
      points: 250,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 8,
      title: "小提琴课一节",
      points: 400,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]);

  // Add new state for showing all rewards
  const [showAllRewards, setShowAllRewards] = useState(false);

  const [history, setHistory] = useState([
    {
      id: 1,
      title: "完成语文作业",
      points: 20,
      type: "earn",
      date: "2025-02-28",
    },
    {
      id: 2,
      title: "兑换冰淇淋",
      points: 100,
      type: "spend",
      date: "2025-02-27",
    },
    {
      id: 3,
      title: "帮爸爸整理书架",
      points: 30,
      type: "earn",
      date: "2025-02-26",
    },
    {
      id: 4,
      title: "完成英语作业",
      points: 20,
      type: "earn",
      date: "2025-02-25",
    },
    {
      id: 5,
      title: "完成数学练习",
      points: 25,
      type: "earn",
      date: "2025-02-24",
    },
    {
      id: 6,
      title: "兑换画画套装",
      points: 300,
      type: "spend",
      date: "2025-02-23",
    },
    {
      id: 7,
      title: "完成科学实验",
      points: 35,
      type: "earn",
      date: "2025-02-22",
    },
    { id: 8, title: "整理房间", points: 15, type: "earn", date: "2025-02-21" },
    { id: 9, title: "背诵古诗", points: 20, type: "earn", date: "2025-02-20" },
    {
      id: 10,
      title: "兑换故事书",
      points: 150,
      type: "spend",
      date: "2025-02-19",
    },
  ]);

  // Add new state for showing all records after the history state:
  const [showAllRecords, setShowAllRecords] = useState(false);

  // 添加作业列表状态
  const [homework, setHomework] = useState([
    {
      id: 1,
      subject: "语文",
      tasks: [
        {
          id: 1,
          title: "阅读课文《春天》",
          duration: "20分钟",
          points: 15,
          completed: false,
          deadline: "15:30",
        },
        {
          id: 2,
          title: "完成练习册第12页",
          duration: "30分钟",
          points: 20,
          completed: true,
          deadline: "16:00",
          wrongAnswers: 2,
        },
      ],
    },
    {
      id: 2,
      subject: "数学",
      tasks: [
        {
          id: 3,
          title: "完成乘法练习",
          duration: "25分钟",
          points: 15,
          completed: false,
          deadline: "16:30",
        },
        {
          id: 4,
          title: "解决应用题5道",
          duration: "20分钟",
          points: 15,
          completed: true,
          deadline: "17:00",
          wrongAnswers: 1,
        },
      ],
    },
    {
      id: 3,
      subject: "英语",
      tasks: [
        {
          id: 5,
          title: "背诵单词列表",
          duration: "15分钟",
          points: 10,
          completed: false,
          deadline: "17:30",
        },
        {
          id: 6,
          title: "完成听力练习",
          duration: "20分钟",
          points: 15,
          completed: true,
          deadline: "18:00",
          wrongAnswers: 0,
        },
      ],
    },
  ]);

  // 添加新的 state 来控制对话框
  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [activePomodoro, setActivePomodoro] = useState(null);
  const [pomodoroStats, setPomodoroStats] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [confirmingReward, setConfirmingReward] = useState(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  // 添加作业日历相关状态
  const [selectedHomeworkDate, setSelectedHomeworkDate] = useState(new Date());
  const [showHomeworkCalendar, setShowHomeworkCalendar] = useState(false);

  const completeTask = (taskId) => {
    // 避免重复完成
    if (tasks.find((t) => t.id === taskId)?.completed) return;

    // 创建完成任务的彩带效果
    createTaskConfetti();

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && !task.completed) {
          setPoints(points + task.points);
          return { ...task, completed: true };
        }
        return task;
      })
    );

    // 检查是否所有任务都已完成
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    const allCompleted = updatedTasks.every((task) => task.completed);

    if (allCompleted) {
      // 显示庆祝效果
      setShowCelebration(true);
      // 额外奖励50积分
      setPoints((prev) => prev + 50);
      // 添加到历史记录
      setHistory([
        {
          id: Date.now(),
          title: "完成所有日常任务",
          points: 50,
          type: "earn",
          date: new Date().toISOString().split("T")[0],
        },
        ...history,
      ]);
    }
  };

  // 2. Update the redeemReward function to handle the confirmation flow
  // Replace the existing redeemReward function with this:
  const redeemReward = (rewardId) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward && points >= reward.points) {
      setPoints(points - reward.points);
      setHistory([
        {
          id: Date.now(),
          title: `兑换${reward.title}`,
          points: reward.points,
          type: "spend",
          date: new Date().toISOString().split("T")[0],
        },
        ...history,
      ]);
      // Close the confirmation dialog
      setConfirmingReward(null);
    }
  };

  // 完成作业任务的处理函数
  const completeHomeworkTask = (subjectId, taskId) => {
    // 避免重复完成
    const task = homework
      .find((s) => s.id === subjectId)
      ?.tasks.find((t) => t.id === taskId);
    if (task?.completed) return;

    // 创建完成任务的彩带效果
    createTaskConfetti();

    setHomework(
      homework.map((subject) => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            tasks: subject.tasks.map((task) => {
              if (task.id === taskId && !task.completed) {
                setPoints(points + task.points);
                return { ...task, completed: true };
              }
              return task;
            }),
          };
        }
        return subject;
      })
    );

    // 检查是否所有作业都已完成
    const updatedHomework = homework.map((subject) => ({
      ...subject,
      tasks: subject.tasks.map((task) =>
        task.id === taskId && subject.id === subjectId
          ? { ...task, completed: true }
          : task
      ),
    }));

    const allCompleted = updatedHomework.every((subject) =>
      subject.tasks.every((task) => task.completed)
    );

    if (allCompleted) {
      setShowCelebration(true);
      setPoints((prev) => prev + 50);
      // 添加到历史记录
      setHistory([
        {
          id: Date.now(),
          title: "完成所有今日作业",
          points: 50,
          type: "earn",
          date: new Date().toISOString().split("T")[0],
        },
        ...history,
      ]);
    }
  };

  // 添加新作业的处理函数
  const handleAddHomework = (newHomework) => {
    const subject = homework.find((s) => s.subject === newHomework.subject);
    if (subject) {
      // 如果科目已存在，添加新任务
      setHomework(
        homework.map((s) => {
          if (s.subject === newHomework.subject) {
            return {
              ...s,
              tasks: [
                ...s.tasks,
                {
                  id: Date.now(),
                  title: newHomework.title,
                  duration: newHomework.duration,
                  points: newHomework.points,
                  completed: false,
                  deadline: newHomework.deadline,
                },
              ],
            };
          }
          return s;
        })
      );
    } else {
      // 如果是新科目，创建新的科目和任务
      setHomework([
        ...homework,
        {
          id: Date.now(),
          subject: newHomework.subject,
          tasks: [
            {
              id: Date.now() + 1,
              title: newHomework.title,
              duration: newHomework.duration,
              points: newHomework.points,
              completed: false,
              deadline: newHomework.deadline,
            },
          ],
        },
      ]);
    }
  };

  // 3. 添加处理添加任务的函数
  // 在 handleAddHomework 函数后添加：
  const handleAddTask = (newTask) => {
    const nextId =
      tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
    setTasks([...tasks, { ...newTask, id: nextId }]);
  };

  // 3. 添加开始番茄计时的函数
  // 在 handleAddHomework 函数后添加以下函数
  const startPomodoro = (subjectId, taskId) => {
    const subject = homework.find((s) => s.id === subjectId);
    const task = subject?.tasks.find((t) => t.id === taskId);

    if (subject && task) {
      setActivePomodoro({
        subjectId,
        taskId,
        taskInfo: {
          subject: subject.subject,
          title: task.title,
          duration: task.duration,
          deadline: task.deadline,
          points: task.points,
        },
      });
    }
  };

  const completePomodoro = () => {
    if (activePomodoro) {
      const { subjectId, taskId } = activePomodoro;
      setPomodoroStats((prev) => {
        const key = `${subjectId}-${taskId}`;
        const current = prev[key] || 0;
        return { ...prev, [key]: current + 1 };
      });
    }
  };

  const cancelPomodoro = () => {
    setActivePomodoro(null);
  };

  // 计算未完成的作业数量
  const unfinishedHomeworkCount = homework.reduce((acc, subject) => {
    return acc + subject.tasks.filter((task) => !task.completed).length;
  }, 0);

  // 计算未完成的任务数量
  const unfinishedTasksCount = tasks.filter((task) => !task.completed).length;

  // 3. 添加处理修改密码的函数
  // 在 RewardConfirmationDialog 函数前添加：
  const handleChangePassword = (passwordData) => {
    // 在实际应用中，这里应该发送请求到后端
    console.log("修改密码:", passwordData);
    // 模拟修改成功
    alert("密码修改成功！");
  };

  // 3. 添加处理日期选择的函数
  // 在 handleChangePassword 函数后添加：
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // 在实际应用中，这里应该根据日期筛选任务
    console.log("选择的日期:", date.toISOString().split("T")[0]);

    // 模拟根据日期筛选任务
    const formattedDate = date.toISOString().split("T")[0];

    // 这里只是示例，实际应用中应该从后端获取特定日期的任务
    if (formattedDate === new Date().toISOString().split("T")[0]) {
      // 如果是今天，显示默认任务
      setTasks([
        {
          id: 1,
          title: "完成数学作业",
          points: 20,
          completed: false,
          time: "今天",
        },
        {
          id: 2,
          title: "阅读30分钟",
          points: 15,
          completed: false,
          time: "今天",
        },
        {
          id: 3,
          title: "整理玩具",
          points: 10,
          completed: false,
          time: "今天",
        },
        {
          id: 4,
          title: "帮妈妈洗碗",
          points: 25,
          completed: false,
          time: "今天",
        },
      ]);
    } else {
      // 如果是其他日期，生成一些示例任务
      setTasks([
        {
          id: 1,
          title: `${date.getMonth() + 1}月${date.getDate()}日任务1`,
          points: Math.floor(Math.random() * 20) + 10,
          completed: false,
          time: `${date.getMonth() + 1}月${date.getDate()}日`,
        },
        {
          id: 2,
          title: `${date.getMonth() + 1}月${date.getDate()}日任务2`,
          points: Math.floor(Math.random() * 20) + 10,
          completed: false,
          time: `${date.getMonth() + 1}月${date.getDate()}日`,
        },
      ]);
    }
  };

  // 添加处理作业日期选择的函数
  const handleHomeworkDateSelect = (date) => {
    setSelectedHomeworkDate(date);
    console.log("选择的作业日期:", date.toISOString().split("T")[0]);

    // 模拟根据日期筛选作业
    const formattedDate = date.toISOString().split("T")[0];

    // 这里只是示例，实际应用中应该从后端获取特定日期的作业
    if (formattedDate === new Date().toISOString().split("T")[0]) {
      // 如果是今天，显示默认作业
      setHomework([
        {
          id: 1,
          subject: "语文",
          tasks: [
            {
              id: 1,
              title: "阅读课文《春天》",
              duration: "20分钟",
              points: 15,
              completed: false,
              deadline: "15:30",
            },
            {
              id: 2,
              title: "完成练习册第12页",
              duration: "30分钟",
              points: 20,
              completed: true,
              deadline: "16:00",
              wrongAnswers: 2,
            },
          ],
        },
        {
          id: 2,
          subject: "数学",
          tasks: [
            {
              id: 3,
              title: "完成乘法练习",
              duration: "25分钟",
              points: 15,
              completed: false,
              deadline: "16:30",
            },
            {
              id: 4,
              title: "解决应用题5道",
              duration: "20分钟",
              points: 15,
              completed: true,
              deadline: "17:00",
              wrongAnswers: 1,
            },
          ],
        },
        {
          id: 3,
          subject: "英语",
          tasks: [
            {
              id: 5,
              title: "背诵单词列表",
              duration: "15分钟",
              points: 10,
              completed: false,
              deadline: "17:30",
            },
            {
              id: 6,
              title: "完成听力练习",
              duration: "20分钟",
              points: 15,
              completed: true,
              deadline: "18:00",
              wrongAnswers: 0,
            },
          ],
        },
      ]);
    } else {
      // 如果是其他日期，生成一些示例作业
      setHomework([
        {
          id: 1,
          subject: "语文",
          tasks: [
            {
              id: 1,
              title: `${date.getMonth() + 1}月${date.getDate()}日语文作业`,
              duration: "30分钟",
              points: 20,
              completed: true,
              deadline: "16:00",
              wrongAnswers: 3,
            },
          ],
        },
        {
          id: 2,
          subject: "数学",
          tasks: [
            {
              id: 2,
              title: `${date.getMonth() + 1}月${date.getDate()}日数学作业`,
              duration: "25分钟",
              points: 15,
              completed: true,
              deadline: "17:00",
              wrongAnswers: 0,
            },
          ],
        },
      ]);
    }
  };

  // 3. Add the confirmation dialog component
  // Add this right before the return statement in the Dashboard component
  const RewardConfirmationDialog = () => {
    if (!confirmingReward) return null;

    const reward = rewards.find((r) => r.id === confirmingReward);
    if (!reward) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
          <h3 className="mb-2 text-xl font-bold text-primary">确认兑换</h3>
          <p className="mb-4 text-gray-600">
            你确定要使用{" "}
            <span className="font-bold text-primary">{reward.points}</span>{" "}
            积分兑换{" "}
            <span className="font-bold text-primary">{reward.title}</span> 吗？
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setConfirmingReward(null)}>
              取消
            </Button>
            <Button
              onClick={() => redeemReward(confirmingReward)}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              确认兑换
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-3 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-3 p-3 mb-4 border-2 shadow-lg sm:mb-6 sm:flex-row sm:items-center sm:gap-0 rounded-2xl bg-white/90 backdrop-blur-sm sm:p-4 border-white/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-purple-400 animate-pulse blur"></div>
              <Avatar className="relative w-12 h-12 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="text-white bg-gradient-to-r from-yellow-400 to-purple-400">
                  小明
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-primary to-purple-600 bg-clip-text">
                你好，小明！
              </h2>
              <p className="text-gray-600">今天也要加油哦！</p>
            </div>
          </div>
          {/* 4. 在 header 部分添加设置按钮
          // 找到 <div className="flex items-center justify-between w-full gap-2 sm:gap-4 sm:w-auto sm:justify-start"> 部分，
          // 修改为： */}
          <div className="flex items-center justify-between w-full gap-2 sm:gap-4 sm:w-auto sm:justify-start">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-gradient-to-r from-yellow-400/10 to-purple-400/10 border-yellow-400/20">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-600 to-purple-600 bg-clip-text">
                {points}
              </span>
              <span className="text-gray-600">积分</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="transition-colors rounded-full hover:bg-blue-100 hover:text-blue-600"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <Settings className="w-5 h-5" />
                <span className="sr-only">修改密码</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="transition-colors rounded-full hover:bg-red-100 hover:text-red-600"
                onClick={logout}
              >
                <LogOut className="w-5 h-5" />
                <span className="sr-only">退出登录</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="homework" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 p-1 text-xs shadow-xl rounded-xl bg-white/80 sm:text-sm md:text-lg">
            <TabsTrigger
              value="homework"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <PenLine className="w-5 h-5 mr-2" />
                <span>作业</span>
                {unfinishedHomeworkCount > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unfinishedHomeworkCount}
                  </span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                <span>任务</span>
                {unfinishedTasksCount > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unfinishedTasksCount}
                  </span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                <span>兑换</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                <span>记录</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* 新增作业标签页内容 */}
          <TabsContent value="homework" className="space-y-4">
            <Card className="overflow-hidden bg-white border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <BookOpen className="w-6 h-6 mr-2 text-primary" />
                    {selectedHomeworkDate.toLocaleDateString("zh-CN", {
                      month: "long",
                      day: "numeric",
                    })}
                    作业
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsAddHomeworkOpen(true)}
                      className="rounded-full bg-gradient-to-r from-primary to-purple-600"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加作业
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() =>
                        setShowHomeworkCalendar(!showHomeworkCalendar)
                      }
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {showHomeworkCalendar ? "隐藏日历" : "查看日历"}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("zh-CN", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <CardDescription>按时完成作业，获得积分奖励！</CardDescription>
                {homework.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-600">
                      今日截止时间: 20:00
                    </span>
                    <span className="text-amber-600">
                      (在截止时间前完成所有作业可获得额外奖励)
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {showHomeworkCalendar && (
                  <div className="mb-6">
                    <TaskCalendar
                      selectedDate={selectedHomeworkDate}
                      onDateSelect={handleHomeworkDateSelect}
                    />
                  </div>
                )}
                {activePomodoro && (
                  <div className="mb-6">
                    <PomodoroTimer
                      onComplete={completePomodoro}
                      onCancel={cancelPomodoro}
                      currentTask={activePomodoro.taskInfo}
                    />
                  </div>
                )}
                <div className="space-y-6">
                  {homework.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-4 border-2 rounded-xl border-primary/10"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary">
                          {subject.subject}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {subject.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 transition-all ${
                              task.completed
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200 bg-white hover:border-primary/30 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                  task.completed
                                    ? "bg-green-500"
                                    : "bg-primary/10"
                                }`}
                              >
                                {task.completed ? (
                                  <Check className="w-6 h-6 text-white" />
                                ) : (
                                  <PenLine className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {task.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    截止 {task.deadline}
                                  </span>
                                  {task.completed &&
                                    task.wrongAnswers !== undefined && (
                                      <span className="flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                        <span
                                          className={
                                            task.wrongAnswers > 0
                                              ? "text-amber-600"
                                              : "text-green-600"
                                          }
                                        >
                                          错题: {task.wrongAnswers}
                                        </span>
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                              <Badge
                                variant="outline"
                                className="flex gap-1 border-yellow-300 bg-yellow-50"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span>{task.points}</span>
                              </Badge>
                              {pomodoroStats[`${subject.id}-${task.id}`] >
                                0 && (
                                <Badge
                                  variant="outline"
                                  className="flex gap-1 border-red-200 bg-red-50"
                                >
                                  <span className="text-red-600">🍅</span>
                                  <span className="text-red-600">
                                    x{" "}
                                    {pomodoroStats[
                                      `${subject.id}-${task.id}`
                                    ] || 0}
                                  </span>
                                </Badge>
                              )}
                              <div className="flex flex-wrap w-full gap-2 mt-2 sm:w-auto sm:mt-0">
                                {!task.completed &&
                                  !(
                                    activePomodoro?.subjectId === subject.id &&
                                    activePomodoro?.taskId === task.id
                                  ) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        startPomodoro(subject.id, task.id)
                                      }
                                      className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                                    >
                                      <Clock className="w-4 h-4 mr-1" />
                                      开始专注
                                    </Button>
                                  )}
                                <Button
                                  size="sm"
                                  disabled={task.completed}
                                  onClick={() =>
                                    completeHomeworkTask(subject.id, task.id)
                                  }
                                  className={`transition-all ${
                                    task.completed
                                      ? "bg-green-500"
                                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                  }`}
                                >
                                  {task.completed ? "已完成" : "完成"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-gray-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      在 20:00 前完成所有作业可获得额外奖励！
                    </span>
                  </div>
                  <Badge variant="outline" className="flex gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    <span>额外 50 积分</span>
                  </Badge>
                </div>
              </CardFooter>
            </Card>

            {/* 作业完成进度卡片 */}
            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-green-400/20 to-emerald-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Award className="w-6 h-6 mr-2 text-primary" />
                    作业完成进度
                  </CardTitle>
                  <CardDescription>今日作业完成情况</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {homework.map((subject) => {
                    const totalTasks = subject.tasks.length;
                    const completedTasks = subject.tasks.filter(
                      (t) => t.completed
                    ).length;
                    const progress = (completedTasks / totalTasks) * 100;

                    return (
                      <div key={subject.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{subject.subject}</span>
                          <span className="text-sm text-muted-foreground">
                            {completedTasks}/{totalTasks}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-3 rounded-full bg-gradient-to-r from-blue-200 to-purple-200"
                          indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                        {/* 在 Progress 组件后添加 */}
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-gray-500">
                            总错题:{" "}
                            {subject.tasks.reduce(
                              (sum, t) => sum + (t.wrongAnswers || 0),
                              0
                            )}
                            个
                          </span>
                          <span className="text-gray-500">
                            平均:{" "}
                            {(
                              subject.tasks.reduce(
                                (sum, t) => sum + (t.wrongAnswers || 0),
                                0
                              ) / subject.tasks.length
                            ).toFixed(1)}
                            个/题
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* 番茄统计卡片 */}
            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-red-400/20 to-orange-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Clock className="w-6 h-6 mr-2 text-red-500" />
                    番茄学习统计
                  </CardTitle>
                  <CardDescription>使用番茄工作法提高学习效率</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">今日番茄数</h3>
                      <p className="text-sm text-muted-foreground">
                        每个番茄代表25分钟的专注学习
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-4xl font-bold text-red-500">
                        {Object.values(pomodoroStats).reduce(
                          (sum, count) => sum + count,
                          0
                        )}
                      </div>
                      <span className="text-2xl">🍅</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">科目番茄分布</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {homework.map((subject) => {
                        const subjectPomodoros = subject.tasks.reduce(
                          (sum, task) => {
                            return (
                              sum +
                              (pomodoroStats[`${subject.id}-${task.id}`] || 0)
                            );
                          },
                          0
                        );

                        return subjectPomodoros > 0 ? (
                          <div
                            key={subject.id}
                            className="p-3 text-center border rounded-lg border-primary/10 bg-primary/5"
                          >
                            <div className="text-sm font-medium">
                              {subject.subject}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <span className="text-red-500">🍅</span>
                              <span className="text-lg font-bold text-primary">
                                {subjectPomodoros}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-primary/10 bg-yellow-50/50">
                    <h3 className="mb-2 font-medium text-amber-800">
                      番茄工作法小贴士
                    </h3>
                    <ul className="space-y-1 text-sm text-amber-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>每25分钟为一个番茄，中间不要分心</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>每个番茄后休息5分钟，让大脑放松</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>完成4个番茄后可以休息较长时间</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* 错题统计卡片 */}
            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-amber-400/20 to-orange-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <AlertCircle className="w-6 h-6 mr-2 text-amber-500" />
                    错题统计
                  </CardTitle>
                  <CardDescription>分析错题情况，找出薄弱环节</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">今日错题总数</h3>
                      <p className="text-sm text-muted-foreground">
                        记录并分析错题，有助于查漏补缺
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-4xl font-bold text-amber-500">
                        {homework.reduce(
                          (sum, subject) =>
                            sum +
                            subject.tasks.reduce(
                              (subSum, task) =>
                                subSum +
                                (task.completed ? task.wrongAnswers || 0 : 0),
                              0
                            ),
                          0
                        )}
                      </div>
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/70 border-amber-200">
                    <div>
                      <h3 className="font-medium text-md">最近7天错题</h3>
                      <p className="text-xs text-muted-foreground">
                        近期学习情况
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-amber-500">
                        {/* 这里假设最近7天的错题数量为12个，实际应用中应从后端获取 */}
                        12
                      </div>
                      <span className="text-xl">📊</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">科目错题分布</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {homework.map((subject) => {
                        const subjectWrongAnswers = subject.tasks.reduce(
                          (sum, task) =>
                            sum + (task.completed ? task.wrongAnswers || 0 : 0),
                          0
                        );

                        return subjectWrongAnswers > 0 ? (
                          <div
                            key={subject.id}
                            className="p-3 text-center border rounded-lg border-amber-200 bg-amber-50"
                          >
                            <div className="text-sm font-medium">
                              {subject.subject}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <span className="text-amber-500">📝</span>
                              <span className="text-lg font-bold text-amber-600">
                                {subjectWrongAnswers}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-amber-200 bg-amber-50/50">
                    <h3 className="mb-2 font-medium text-amber-800">
                      错题分析小贴士
                    </h3>
                    <ul className="space-y-1 text-sm text-amber-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>定期复习错题，巩固薄弱知识点</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>分析错题原因，是粗心还是概念不清</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>建立错题本，记录易错知识点</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                {/* 4. 在 return 语句中的 TabsContent value="tasks" 部分，修改 CardHeader 部分
                // 找到 <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20"> 下的内容，
                // 将 <div className="flex items-center justify-between"> 部分替换为： */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <BookOpen className="w-6 h-6 mr-2 text-primary" />
                    {selectedDate.toLocaleDateString("zh-CN", {
                      month: "long",
                      day: "numeric",
                    })}
                    任务
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIsAddTaskOpen(true)}
                      className="rounded-full bg-gradient-to-r from-primary to-purple-600"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加任务
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {showCalendar ? "隐藏日历" : "查看日历"}
                    </Button>
                  </div>
                </div>
                <CardDescription>完成任务获得积分奖励！</CardDescription>
              </CardHeader>
              {/* 5. 在 CardContent 部分添加日历组件
              // 找到 <CardContent className="p-6"> 下的内容，
              // 在 <div className="space-y-4"> 前添加： */}
              <CardContent className="p-6">
                {showCalendar && (
                  <div className="mb-6">
                    <TaskCalendar
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border-2 p-4 transition-all ${
                        task.completed
                          ? "border-green-200 bg-gradient-to-r from-green-100 to-emerald-50"
                          : "border-primary/20 bg-white hover:border-primary/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            task.completed ? "bg-green-500" : "bg-primary/20"
                          }`}
                        >
                          {task.completed ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-lg font-bold text-primary">
                              {task.id}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-14 sm:ml-0">
                        <Badge
                          variant="outline"
                          className="flex gap-1 border-yellow-300 bg-yellow-50"
                        >
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                          <span>{task.points}</span>
                        </Badge>
                        <Button
                          size="sm"
                          disabled={task.completed}
                          onClick={() => completeTask(task.id)}
                          className={`transition-all ${
                            task.completed
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          }`}
                        >
                          {task.completed ? "已完成" : "完成"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-green-500/10">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Award className="w-6 h-6 mr-2 text-primary" />
                    成就进度
                  </CardTitle>
                  <CardDescription>看看你的进步吧！</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">阅读小达人</span>
                      <span className="text-sm text-muted-foreground">
                        7/10
                      </span>
                    </div>
                    <Progress
                      value={70}
                      className="h-3 rounded-full bg-gradient-to-r from-blue-200 to-purple-200"
                      indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">数学小能手</span>
                      <span className="text-sm text-muted-foreground">
                        5/10
                      </span>
                    </div>
                    <Progress value={50} className="h-3 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">整理小能手</span>
                      <span className="text-sm text-muted-foreground">3/5</span>
                    </div>
                    <Progress value={60} className="h-3 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20 bg-gradient-to-br from-pink-50 to-yellow-50">
              <CardHeader className="bg-gradient-to-r from-pink-400/20 via-orange-400/20 to-yellow-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Gift className="w-6 h-6 mr-2 text-primary" />
                    积分兑换
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    <span className="font-bold text-primary">{points}</span>
                  </div>
                </div>
                <CardDescription>用你的积分兑换心仪的奖励！</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="transition-all duration-300 ease-in-out">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                    {rewards
                      .slice(0, showAllRewards ? rewards.length : 4)
                      .map((reward) => (
                        <div
                          key={reward.id}
                          className="flex flex-col overflow-hidden transition-all border-2 rounded-xl border-primary/20 bg-gradient-to-br from-white to-purple-50 hover:border-primary/50 hover:shadow-xl"
                        >
                          <div className="flex items-center gap-2 p-3 sm:gap-4 sm:p-4">
                            <div className="flex items-center justify-center w-16 h-16 sm:h-20 sm:w-20 rounded-xl bg-primary/10">
                              <img
                                src={reward.image || "/placeholder.svg"}
                                alt={reward.title}
                                className="object-contain w-16 h-16"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{reward.title}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span className="font-bold text-primary">
                                  {reward.points}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  积分
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 mt-auto bg-primary/5">
                            {/* 4. Update the rewards mapping in the JSX to show the confirmation dialog */}
                            {/* Find the Button inside the rewards.map section that says "立即兑换" and replace it with: */}
                            <Button
                              className="w-full"
                              disabled={points < reward.points}
                              onClick={() => setConfirmingReward(reward.id)}
                            >
                              {points < reward.points ? "积分不足" : "立即兑换"}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-primary/5">
                <Button
                  variant="outline"
                  className="w-full transition-all duration-300 hover:bg-primary/10"
                  onClick={() => setShowAllRewards(!showAllRewards)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {showAllRewards ? "收起奖励" : "查看更多奖励"}
                  <ChevronRight
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                      showAllRewards ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="overflow-hidden border-2 rounded-2xl border-primary/20 bg-gradient-to-br from-blue-50 to-green-50">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-teal-400/20 to-green-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <History className="w-6 h-6 mr-2 text-primary" />
                    积分记录
                  </CardTitle>
                  <CardDescription>查看你的积分获取和使用历史</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-3 transition-all duration-300 ease-in-out">
                    {history
                      .slice(0, showAllRecords ? history.length : 4)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-white border-2 rounded-xl border-primary/20"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                item.type === "earn"
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }`}
                            >
                              {item.type === "earn" ? (
                                <Plus className="w-5 h-5 text-green-600" />
                              ) : (
                                <Gift className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.date}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-1 font-bold ${
                              item.type === "earn"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.type === "earn" ? "+" : "-"}
                            {item.points}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-primary/5">
                <Button
                  variant="outline"
                  className="w-full transition-all duration-300 hover:bg-primary/10"
                  onClick={() => setShowAllRecords(!showAllRecords)}
                >
                  {showAllRecords ? "收起记录" : "查看更多记录"}
                  <ChevronRight
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                      showAllRecords ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating Animation Elements */}
        <div className="fixed pointer-events-none bottom-10 right-10 animate-bounce">
          <Star className="w-12 h-12 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="fixed pointer-events-none bottom-20 left-10 animate-pulse">
          <Award className="w-10 h-10 text-blue-400" />
        </div>
        {/* 添加更多浮动动画元素 */}
        <div className="fixed pointer-events-none top-10 right-20 animate-pulse">
          <Gift className="w-8 h-8 text-pink-400" />
        </div>
        <div className="fixed pointer-events-none top-20 left-20 animate-bounce">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="fixed delay-150 pointer-events-none bottom-40 right-20 animate-bounce">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        {/* 5. Add the confirmation dialog to the JSX */}
        {/* Add this right before the closing </div> of the main container div (before the AddHomeworkDialog) */}
        {/* 兑换确认对话框 */}
        <RewardConfirmationDialog />
      </div>
      {/* 添加作业对话框 */}
      <AddHomeworkDialog
        isOpen={isAddHomeworkOpen}
        onClose={() => setIsAddHomeworkOpen(false)}
        onAdd={handleAddHomework}
      />
      {/* 5. 在组件最后，在 AddHomeworkDialog 后添加 AddTaskDialog
      // 在 <AddHomeworkDialog /> 后添加： */}
      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleAddTask}
      />
      {/* 5. 在组件最后，在 AddTaskDialog 后添加 ChangePasswordDialog
      // 在 <AddTaskDialog /> 后添加： */}
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSubmit={handleChangePassword}
        userType="child"
      />
      {/* 只保留一个庆祝动画组件 */}
      {showCelebration && (
        <ConfettiCelebration onComplete={() => setShowCelebration(false)} />
      )}
      {/*{showCelebration && <CompletionCelebration onClose={() => setShowCelebration(false)} />}*/}
    </div>
  );
}
