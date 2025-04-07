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
import { get, post, put } from "@/lib/http";

// 计算错题统计的辅助函数
const calculateWrongAnswersStats = (homeworks) => {
  // 计算总错题数
  const totalWrongAnswers = homeworks.reduce(
    (sum, subject) =>
      sum +
      subject.tasks.reduce(
        (subSum, task) =>
          subSum +
          (task.completed ? task.incorrect || 0 : 0),
        0
      ),
    0
  );
  
  // 计算总作业数
  const totalTasks = homeworks.reduce(
    (sum, subject) => sum + subject.tasks.length,
    0
  );
  
  // 计算平均错题数
  const avgWrongAnswers = totalTasks > 0 
    ? (totalWrongAnswers / totalTasks).toFixed(1) 
    : "0.0";
  
  return {
    totalWrongAnswers,
    totalTasks,
    avgWrongAnswers
  };
};

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

// 根据任务标题返回适当的图标
function getTaskIcon(title) {
  // 添加对title是否存在的检查
  if (!title) {
    return <Sparkles className="w-5 h-5 text-primary" />;
  }
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes("阅读") || titleLower.includes("读")) {
    return <BookOpen className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("整理") || titleLower.includes("收拾") || titleLower.includes("打扫")) {
    return <ShoppingBag className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("帮") || titleLower.includes("协助")) {
    return <Award className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("完成") || titleLower.includes("作业") || titleLower.includes("习题")) {
    return <PenLine className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("运动") || titleLower.includes("锻炼")) {
    return <Sparkles className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("时间") || titleLower.includes("分钟") || titleLower.includes("点")) {
    return <Clock className="w-5 h-5 text-primary" />;
  } else {
    return <Sparkles className="w-5 h-5 text-primary" />;
  }
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(350);
  const [subjects, setSubjects] = useState([]);

  // 添加作业列表状态
  const [homeworks, setHomeworks] = useState([]);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);

  // 修改任务状态的初始值为空数组
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // 添加积分兑换列表状态
  const [rewards, setRewards] = useState([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);

  // 添加显示所有奖励状态
  const [showAllRewards, setShowAllRewards] = useState(false);

  // 添加积分记录状态
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

  // 添加显示所有记录状态
  const [showAllRecords, setShowAllRecords] = useState(false);

  // 获取作业数据
  const fetchHomeworks = async () => {
    try {
      setIsLoadingHomework(true);

      // 使用封装的get方法替代fetch
      const response = await get("/api/homework");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedHomework = formatHomeworkData(result.data);
        setHomeworks(formattedHomework);
      } else {
        console.error("获取作业失败:", result.message);
      }
    } catch (error) {
      console.error("获取作业数据出错:", error);
    } finally {
      setIsLoadingHomework(false);
    }
  };

  // 格式化作业数据
  const formatHomeworkData = (apiData) => {
    // 按科目分组
    const subjectMap = {};

    apiData.forEach((item) => {
      const subjectId = item.subject_id || 0;
      const subjectName = item.subject_name;

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          id: subjectId,
          subject: subjectName,
          tasks: [],
        };
      }

      subjectMap[subjectId].tasks.push({
        id: item.id,
        name: item.name,
        duration: item.estimated_duration
          ? `${item.estimated_duration}分钟`
          : "未设置",
        points: item.integral || 0,
        completed: item.is_complete === "1",
        deadline: item.deadline
          ? item.deadline.split(" ")[1].substring(0, 5)
          : "未设置",
        incorrect: item.incorrect || 0,
        pomodoro: item.pomodoro || 0, // 确保包含番茄钟数量
      });
    });

    // 初始化番茄钟统计
    const pomodoroStatsData = {};
    apiData.forEach((item) => {
      if (item.pomodoro && item.pomodoro > 0) {
        const key = `${item.subject_id}-${item.id}`;
        pomodoroStatsData[key] = item.pomodoro;
      }
    });

    // 更新番茄钟统计状态
    setPomodoroStats(pomodoroStatsData);

    return Object.values(subjectMap);
  };

  // 添加获取用户信息的函数
  const fetchUserInfo = async () => {
    try {
      const response = await get("/api/account");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 设置用户信息到状态中
        setUser(result.data);
        setName(result.data.name);
        setPoints(result.data.points);
        console.log("获取用户信息成功:", result.data);
      } else {
        console.error("获取用户信息失败:", result.message);
      }
    } catch (error) {
      console.error("获取用户信息出错:", error);
    }
  };

  // 获取科目数据
  const fetchSubjects = async () => {
    const response = await get("/api/subject");
    const result = await response.json();
    setSubjects(result.data);
  };

  // 添加获取任务的函数
  const fetchTasks = async () => {
    try {
      setIsLoadingTasks(true);

      // 使用封装的get方法获取任务数据
      const response = await get("/api/task");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 格式化任务数据
        const formattedTasks = result.data.map(task => ({
          id: task.id,
          title: task.name,
          points: task.integral || 0,
          completed: task.is_complete === "1" ? true : false,
          time: task.task_date ? new Date(task.task_date).toLocaleDateString("zh-CN") : "今天"
        }));
        
        setTasks(formattedTasks);
      } else {
        console.error("获取任务失败:", result.message);
        setTasks([]); // 获取失败时设置为空数组
      }
    } catch (error) {
      console.error("获取任务数据出错:", error);
      setTasks([]); // 出错时设置为空数组
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // 添加获取奖励列表的函数
  const fetchRewards = async () => {
    try {
      setIsLoadingRewards(true);

      // 使用封装的get方法获取奖励数据
      const response = await get("/api/reward");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据设置到状态中
        setRewards(result.data.map(reward => ({
          id: reward.id,
          title: reward.name,
          points: reward.integral || 0,
          image: reward.pic ? 
                (reward.pic_ext ? `data:image/${reward.pic_ext};base64,${reward.pic}` : reward.pic) : 
                "/placeholder.svg?height=80&width=80",
        })));
        console.log("获取奖励列表成功:", result.data);
      } else {
        console.error("获取奖励列表失败:", result.message);
        setRewards([]); // 获取失败时设置为空数组
      }
    } catch (error) {
      console.error("获取奖励数据出错:", error);
      setRewards([]); // 出错时设置为空数组
    } finally {
      setIsLoadingRewards(false);
    }
  };

  // 修改 useEffect 中的数据获取
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchUserInfo();
        await fetchSubjects();
        await fetchHomeworks();
        await fetchTasks(); 
        await fetchRewards(); // 添加获取奖励列表
      } catch (error) {
        console.error("数据获取失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

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

  const completeTask = async (taskId) => {
    // 避免重复完成
    if (tasks.find((t) => t.id === taskId)?.completed) return;

    try {
      // 调用API完成任务
      const response = await post("/api/task/complete", {
        taskId: taskId
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        // 创建完成任务的彩带效果
        createTaskConfetti();
        
        // 找到当前任务以获取其积分值
        const task = tasks.find(t => t.id === taskId);
        const taskPoints = task ? task.points : 0;
        
        // 更新本地任务状态
        setTasks(
          tasks.map((task) => {
            if (task.id === taskId && !task.completed) {
              return { ...task, completed: true };
            }
            return task;
          })
        );
        
        // 更新积分
        setPoints(points + taskPoints);

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
      } else {
        console.error("完成任务失败:", result.message);
      }
    } catch (error) {
      console.error("完成任务时出错:", error);
    }
  };

  const redeemReward = async (rewardId) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward && points >= reward.points) {
      try {
        // 调用API兑换奖励
        const response = await put("/api/reward/redeem", {
          rewardId: rewardId
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
          
          // 添加到历史记录
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
          
          // 关闭确认对话框
          setConfirmingReward(null);
          
          // 创建兑换成功的彩带效果
          createTaskConfetti();
          
          console.log("奖励兑换成功");
        } else {
          console.error("兑换奖励失败:", result.message);
        }
      } catch (error) {
        console.error("兑换奖励出错:", error);
      }
    }
  };

  // 完成作业任务的处理函数
  const completeHomeworkTask = async (subjectId, taskId) => {
    // 避免重复完成
    const task = homeworks
      .find((s) => s.id === subjectId)
      ?.tasks.find((t) => t.id === taskId);
    if (task?.completed) return;

    try {
      const response = await post("/api/homework/complete", {
        homeworkId: taskId,
      });

      const result = await response.json();

      if (result.code === 200) {
        // 创建完成任务的彩带效果
        createTaskConfetti();

        // 更新本地状态
        setHomeworks(
          homeworks.map((subject) => {
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
        const updatedHomework = homeworks.map((subject) => ({
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
      } else {
        console.error("更新作业状态失败:", result.message);
      }
    } catch (error) {
      console.error("完成作业任务出错:", error);
    }
  };

  // 添加新作业的处理函数
  const handleAddHomework = async (newHomework) => {
    try {
      // 准备API请求数据
      const subjectId = newHomework.subject_id;  // 修改这里，使用subject_id而不是subject
      const homeworkData = {
        name: newHomework.name,
        subject_id: subjectId,
        estimated_duration: parseInt(newHomework.duration) || null,
        deadline: newHomework.deadline
          ? `${new Date().toISOString().split("T")[0]} ${newHomework.deadline}`
          : null,
        integral: parseInt(newHomework.points) || 0,
        homework_date: new Date().toISOString().split("T")[0],
      };

      // 使用封装的post方法替代fetch
      const response = await post("/api/homework", homeworkData);
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 添加成功后刷新作业列表
        fetchHomeworks();
      } else {
        console.error("添加作业失败:", result.message);
      }
    } catch (error) {
      console.error("添加作业出错:", error);
    }
  };

  // 添加处理添加任务的函数
  const handleAddTask = async (newTask) => {
    try {
      // 准备API请求数据
      const taskData = {
        name: newTask.title,
        integral: parseInt(newTask.points) || 0,
      };

      // 使用封装的post方法向API发送请求
      const response = await post("/api/task", taskData);
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 添加成功后刷新任务列表
        fetchTasks();
        console.log("任务添加成功:", result.data);
      } else {
        console.error("添加任务失败:", result.message);
      }
    } catch (error) {
      console.error("添加任务出错:", error);
    }
  };

  // 添加开始番茄计时的函数
  const startPomodoro = (subjectId, taskId) => {
    const subject = homeworks.find((s) => s.id === subjectId);
    const task = subject?.tasks.find((t) => t.id === taskId);

    if (subject && task) {
      setActivePomodoro({
        subjectId,
        taskId,
        taskInfo: {
          subject: subject.subject,
          name: task.name,
          duration: task.duration,
          deadline: task.deadline,
          points: task.points,
          pomodoro: task.pomodoro || 0, // 添加已完成的番茄钟数量
        },
      });
    }
  };

  const completePomodoro = async () => {
    if (activePomodoro) {
      const { subjectId, taskId } = activePomodoro;

      try {
        // 调用番茄钟API更新服务器数据
        const response = await post("/api/homework/pomodoro", {
          homeworkId: taskId,
        });

        const result = await response.json();

        if (result.code === 200) {
          // 确保API返回了最新的番茄钟数量
          const newPomodoroCount = result.data.pomodoro || 0;

          // 更新本地番茄钟统计
          setPomodoroStats((prev) => {
            const key = `${subjectId}-${taskId}`;
            return { ...prev, [key]: newPomodoroCount };
          });

          // 更新作业的番茄钟数量
          setHomeworks(
            homeworks.map((subject) => {
              if (subject.id === subjectId) {
                return {
                  ...subject,
                  tasks: subject.tasks.map((task) => {
                    if (task.id === taskId) {
                      // 使用服务器返回的番茄钟数量
                      const updatedTask = {
                        ...task,
                        pomodoro: newPomodoroCount,
                      };

                      // 更新activePomodoro中的任务信息，这样PomodoroTimer也会更新
                      setActivePomodoro((prev) => ({
                        ...prev,
                        taskInfo: {
                          ...prev.taskInfo,
                          pomodoro: newPomodoroCount,
                        },
                      }));

                      return updatedTask;
                    }
                    return task;
                  }),
                };
              }
              return subject;
            })
          );

          // 更新本地积分
          setPoints((prev) => prev + 5);

          // 添加到积分历史记录
          setHistory([
            {
              id: Date.now(),
              title: `完成 ${activePomodoro.taskInfo.name} 的番茄钟学习`,
              points: 5,
              type: "01",
              date: new Date().toISOString().split("T")[0],
            },
            ...history,
          ]);

          console.log("番茄钟完成，积分已更新");
        } else {
          console.error("番茄钟API调用失败:", result.message);
        }
      } catch (error) {
        console.error("番茄钟完成处理出错:", error);
      }
    }
  };
  const cancelPomodoro = () => {
    setActivePomodoro(null);
  };

  // 计算未完成的作业数量
  const unfinishedHomeworkCount = homeworks.reduce((acc, subject) => {
    return acc + subject.tasks.filter((task) => !task.completed).length;
  }, 0);

  // 计算未完成的任务数量
  const unfinishedTasksCount = tasks.filter((task) => !task.completed).length;

  // 修改密码的函数
  const handleChangePassword = async (passwordData) => {
    try {
      // 调用API更新密码
      const response = await put("/api/account/password", {
        password: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        // 修改成功
        console.log("密码修改成功:", result.data);
        return { success: true };
      } else {
        // 修改失败
        console.error("密码修改失败:", result.message);
        return { success: false, message: result.message || "密码修改失败" };
      }
    } catch (error) {
      console.error("修改密码时出错:", error);
      return { success: false, message: "修改密码时出错，请稍后再试" };
    }
  };

  // 添加处理日期选择的函数
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    
    // 使用本地日期格式，避免时区问题
    // 创建一个新的日期对象避免修改原始对象
    const localDate = new Date(date);
    
    // 格式化为YYYY-MM-DD格式
    const formattedDate = localDate.getFullYear() + '-' + 
                          String(localDate.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(localDate.getDate()).padStart(2, '0');
    
    try {
      setIsLoadingTasks(true);
      
      // 调用API获取该日期的任务，日志API请求URL
      const apiUrl = `/api/task?taskDate=${formattedDate}`;
      console.log("任务API请求URL:", apiUrl);
      
      const response = await get(apiUrl);
      const result = await response.json();

      console.log("任务API响应:", result);

      if (result.code === 200 && result.data) {
        // 格式化任务数据
        const formattedTasks = result.data.map(task => ({
          id: task.id,
          title: task.name,
          points: task.integral || 0,
          completed: task.is_complete === "1" ? true : false,
          time: task.task_date ? new Date(task.task_date).toLocaleDateString("zh-CN") : "今天"
        }));
        
        setTasks(formattedTasks);
        console.log(`已获取${formattedDate}的任务数据，共${result.data.length}条记录`, formattedTasks);
      } else {
        console.error("获取任务数据失败:", result.message);
        // 如果API调用失败或无数据，设置空的任务列表
        setTasks([]);
      }
    } catch (error) {
      console.error("获取任务数据出错:", error);
      // 出错时设置空的任务列表
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // 添加处理作业日期选择的函数
  const handleHomeworkDateSelect = async (date) => {
    setSelectedHomeworkDate(date);
    
    // 使用本地日期格式，避免时区问题
    // 创建一个新的日期对象避免修改原始对象
    const localDate = new Date(date);
    
    // 格式化为YYYY-MM-DD格式
    const formattedDate = localDate.getFullYear() + '-' + 
                          String(localDate.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(localDate.getDate()).padStart(2, '0');
    
    try {
      // 调用API获取该日期的作业，日志API请求URL
      const apiUrl = `/api/homework?homeworkDate=${formattedDate}`;
      console.log("API请求URL:", apiUrl);
      
      const response = await get(apiUrl);
      const result = await response.json();

      console.log("API响应:", result);

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedHomework = formatHomeworkData(result.data);
        setHomeworks(formattedHomework);
        console.log(`已获取${formattedDate}的作业数据，共${result.data.length}条记录`, formattedHomework);
      } else {
        console.error("获取作业数据失败:", result.message);
        
        // 如果API调用失败或无数据，设置空的作业列表
        setHomeworks([]);
      }
    } catch (error) {
      console.error("获取作业数据出错:", error);
      // 出错时设置空的作业列表
      setHomeworks([]);
    }
  };

  // 3. Add the confirmation dialog component
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

  // 加载中状态显示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="text-center">
          <div className="flex justify-center mb-4 space-x-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
            <div
              className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold text-white">小朋友积分乐园</h2>
          <p className="mt-2 text-white">正在加载中...</p>
        </div>
      </div>
    );
  }

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
                  {name ? name.substring(0, 2) : "用户"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-primary to-purple-600 bg-clip-text">
                你好，{name || "同学"}！
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
                {homeworks.length > 0 && (
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
                  {isLoadingHomework ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-primary"></div>
                    </div>
                  ) : homeworks.length > 0 ? (
                    homeworks.map((subject) => (
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
                                    // 使用getTaskIcon函数来选择图标
                                    getTaskIcon(task.title)
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.name}</h4>
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
                                      task.incorrect !== undefined && (
                                        <span className="flex items-center gap-1">
                                          <AlertCircle className="w-4 h-4 text-amber-500" />
                                          <span
                                            className={
                                              task.incorrect > 0
                                                ? "text-amber-600"
                                                : "text-green-600"
                                            }
                                          >
                                            错题: {task.incorrect}
                                          </span>
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-14 sm:ml-0">
                                {task.pomodoro > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="flex gap-1 border-red-200 bg-red-50"
                                  >
                                    <span className="text-red-600">🍅</span>
                                    <span className="text-red-600">
                                      x {task.pomodoro}
                                    </span>
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className="flex gap-1 border-yellow-300 bg-yellow-50"
                                >
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                  <span>{task.points}</span>
                                </Badge>
                                <div className="flex flex-wrap w-full gap-2 mt-2 sm:w-auto sm:mt-0">
                                  {!task.completed &&
                                    !(
                                      activePomodoro?.subjectId ===
                                        subject.id &&
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
                    ))
                  ) : (
                    <div className="p-6 text-center bg-white rounded-lg shadow">
                      <p className="text-gray-500">
                        今天没有作业，好好休息吧！
                      </p>
                    </div>
                  )}
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
                  {homeworks.map((subject) => {
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
                            {(() => {
                              // 为单个科目计算错题统计
                              const totalWrongAnswers = subject.tasks.reduce(
                                (sum, t) => sum + (t.incorrect || 0),
                                0
                              );
                              return totalWrongAnswers;
                            })()}
                            个
                          </span>
                          <span className="text-gray-500">
                            平均:{" "}
                            {(() => {
                              // 为单个科目计算平均错题
                              const totalWrongAnswers = subject.tasks.reduce(
                                (sum, t) => sum + (t.incorrect || 0),
                                0
                              );
                              return subject.tasks.length > 0
                                ? (totalWrongAnswers / subject.tasks.length).toFixed(1)
                                : "0.0";
                            })()}
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
                      {homeworks.map((subject) => {
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
                        {calculateWrongAnswersStats(homeworks).totalWrongAnswers}
                      </div>
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/70 border-amber-200">
                    <div>
                      <h3 className="font-medium text-md">平均错题数</h3>
                      <p className="text-xs text-muted-foreground">
                        每道题平均错题数
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-amber-500">
                        {calculateWrongAnswersStats(homeworks).avgWrongAnswers}
                      </div>
                      <span className="text-xl">📊</span>
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
                      {homeworks.map((subject) => {
                        const subjectWrongAnswers = subject.tasks.reduce(
                          (sum, task) =>
                            sum + (task.completed ? task.incorrect || 0 : 0),
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
                  {isLoadingTasks ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-primary"></div>
                    </div>
                  ) : tasks.length > 0 ? (
                    tasks.map((task) => (
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
                              task.completed ? "bg-green-500" : "bg-primary/10"
                            }`}
                          >
                            {task.completed ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              // 根据任务标题选择适当的图标
                              getTaskIcon(task.title)
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
                    ))
                  ) : (
                    <div className="p-6 text-center bg-white rounded-lg shadow">
                      <p className="text-gray-500">今天还没有添加任务哦！</p>
                    </div>
                  )}
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
                    {isLoadingRewards ? (
                      <div className="flex items-center justify-center h-40 col-span-2">
                        <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-primary"></div>
                      </div>
                    ) : rewards.length > 0 ? (
                      rewards
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
                              <Button
                                className="w-full"
                                disabled={points < reward.points}
                                onClick={() => setConfirmingReward(reward.id)}
                              >
                                {points < reward.points ? "积分不足" : "立即兑换"}
                              </Button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="col-span-2 p-6 text-center bg-white rounded-lg shadow">
                        <p className="text-gray-500">暂时没有可兑换的奖励哦！</p>
                      </div>
                    )}
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

        <div className="fixed pointer-events-none bottom-10 right-10 animate-bounce">
          <Star className="w-12 h-12 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="fixed pointer-events-none bottom-20 left-10 animate-pulse">
          <Award className="w-10 h-10 text-blue-400" />
        </div>
        <div className="fixed pointer-events-none top-10 right-20 animate-pulse">
          <Gift className="w-8 h-8 text-pink-400" />
        </div>
        <div className="fixed pointer-events-none top-20 left-20 animate-bounce">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="fixed delay-150 pointer-events-none bottom-40 right-20 animate-bounce">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <RewardConfirmationDialog />
      </div>
      <AddHomeworkDialog
        isOpen={isAddHomeworkOpen}
        onClose={() => setIsAddHomeworkOpen(false)}
        onAdd={handleAddHomework}
        subjects={subjects}
        childId={user.id}
      />
      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleAddTask}
      />
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
