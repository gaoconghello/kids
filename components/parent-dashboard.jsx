"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Gift,
  BookOpen,
  History,
  ChevronRight,
  Check,
  Plus,
  Clock,
  PenLine,
  User,
  ClipboardCheck,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Award,
  LogOut,
  Settings,
  BarChart3,
  Sparkles,
  ShoppingBag,
  Trash,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { AddTaskDialog } from "./add-task-dialog";
import { AddRewardDialog } from "./add-reward-dialog";
import { ApprovalDialog } from "./approval-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";
import { Progress } from "@/components/ui/progress";
import { TaskCalendar } from "./task-calendar";
import { HomeworkStatistics } from "./homework-statistics";
import { DeadlineSettingsDialog } from "./deadline-settings-settings-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/app/providers/AuthProvider";
import { get, post, put, del } from "@/lib/http";

// 计算错题统计的辅助函数
const calculateWrongAnswersStats = (homeworks) => {
  // 计算总错题数
  const totalWrongAnswers = homeworks.reduce(
    (sum, subject) =>
      sum +
      subject.tasks.reduce(
        (subSum, task) =>
          subSum + (task.completed ? task.wrongAnswers || 0 : 0),
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
  const avgWrongAnswers =
    totalTasks > 0 ? (totalWrongAnswers / totalTasks).toFixed(1) : "0.0";

  return {
    totalWrongAnswers,
    totalTasks,
    avgWrongAnswers,
  };
};

// 根据任务标题返回适当的图标
function getTaskIcon(title) {
  // 添加对title是否存在的检查
  if (!title) {
    return <Sparkles className="w-5 h-5 text-primary" />;
  }

  const titleLower = title.toLowerCase();

  if (titleLower.includes("阅读") || titleLower.includes("读")) {
    return <BookOpen className="w-5 h-5 text-primary" />;
  } else if (
    titleLower.includes("整理") ||
    titleLower.includes("收拾") ||
    titleLower.includes("打扫")
  ) {
    return <ShoppingBag className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("帮") || titleLower.includes("协助")) {
    return <Award className="w-5 h-5 text-primary" />;
  } else if (
    titleLower.includes("完成") ||
    titleLower.includes("作业") ||
    titleLower.includes("习题")
  ) {
    return <PenLine className="w-5 h-5 text-primary" />;
  } else if (titleLower.includes("运动") || titleLower.includes("锻炼")) {
    return <Sparkles className="w-5 h-5 text-primary" />;
  } else if (
    titleLower.includes("时间") ||
    titleLower.includes("分钟") ||
    titleLower.includes("点")
  ) {
    return <Clock className="w-5 h-5 text-primary" />;
  } else {
    return <Sparkles className="w-5 h-5 text-primary" />;
  }
}

export default function ParentDashboard() {
  const { logout } = useAuth();
  const [points, setPoints] = useState(350);
  const [childPoints, setChildPoints] = useState({
    total: 0,
    thisWeek: 0,
    thisWeekSpent: 0,
  });

  const [subjects, setSubjects] = useState([]);
  const [pendingHomework, setPendingHomework] = useState([]);
  const [completedHomework, setCompletedHomework] = useState([]);
  const [childHomework, setChildHomework] = useState([]);

  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [childTasks, setChildTasks] = useState([]);

  const [rewards, setRewards] = useState([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);

  const [pendingRewards, setPendingRewards] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [history, setHistory] = useState([]);

  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);

  const [selectedTaskDate, setSelectedTaskDate] = useState(new Date());
  const [showTaskCalendar, setShowTaskCalendar] = useState(false);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null); // 添加一个变量跟踪当前选中的孩子ID
  const [selectedChild, setSelectedChild] = useState(null); // 保存当前选中孩子的完整信息

  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalItem, setApprovalItem] = useState(null);
  const [approvalType, setApprovalType] = useState(""); // homework, task, reward
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeadlineSettingsOpen, setIsDeadlineSettingsOpen] = useState(false);
  const [deadlineSettings, setDeadlineSettings] = useState({});
  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedHomeworkDate, setSelectedHomeworkDate] = useState(new Date());
  const [showHomeworkCalendar, setShowHomeworkCalendar] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化截止时间设置
  const fetchDeadlineSettings = async () => {
    try {
      const response = await get("/api/family/deadline");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        setDeadlineSettings({
          enabled: result.data.is_deadline,
          time: result.data.deadline,
          bonusPoints: result.data.integral,
        });
      }
    } catch (error) {
      console.error("获取截止时间设置失败:", error);
    }
  };

  // 获取科目数据
  const fetchSubjects = async () => {
    try {
      const response = await get("/api/subject");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        setSubjects(result.data);
        console.log("获取科目列表成功:", result.data);
      } else {
        console.error("获取科目列表失败:", result.message);
      }
    } catch (error) {
      console.error("获取科目数据出错:", error);
    }
  };



  // 获取待新增作业
  const fetchPendingHomeworks = async () => {
    try {
      // 显示加载状态
      setIsLoading(true);

      console.log("获取待新增作业");

      // 调用API获取待处理任务
      const response = await get(
        `/api/homework/pending?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedHomeworks = result.data.map((homework) => ({
          id: homework.id,
          childName: selectedChild?.name || "未知",
          subject: homework.subject_name,
          title: homework.name,
          duration: homework.estimated_duration || 0,
          deadline: homework.deadline || "",
          points: homework.integral || 0,
          status: "pending",
          completedAt: homework.complete_time,
        }));

        setPendingHomework(formattedHomeworks);
      } else {
        console.error("获取待处理作业失败:", result.message);
      }
    } catch (error) {
      console.error("获取待处理作业数据出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取已完成作业
  const fetchCompletedHomeworks = async () => {
    try {
      setIsLoading(true);

      console.log("获取已完成作业");

      const response = await get(
        `/api/homework/complete?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        const formattedHomeworks = result.data.map((homework) => ({
          id: homework.id,
          childName: selectedChild?.name || "未知",
          subject: homework.subject_name,
          title: homework.name,
          duration: `${homework.estimated_duration}分钟`,
          points: homework.integral || 0,
          status: "completed",
          completedAt: homework.complete_time,
        }));

        setCompletedHomework(formattedHomeworks);
      } else {
        console.error("获取已完成作业失败:", result.message);
      }
    } catch (error) {
      console.error("获取已完成作业数据出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChildHomeworks = async () => {
    try {
      setIsLoading(true);
      console.log("获取孩子作业");
      const response = await get(
        `/api/homework/parent?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据按科目分组
        const groupedHomework = result.data.reduce((acc, homework) => {
          const subject = acc.find((s) => s.id === homework.subject_id);
          const task = {
            id: homework.id,
            title: homework.name,
            duration: `${homework.estimated_duration}分钟`,
            points: homework.integral || 0,
            completed: homework.is_complete === "1",
            deadline: homework.deadline?.split(" ")[1] || "",
            wrongAnswers: homework.incorrect || 0,
          };

          if (subject) {
            subject.tasks.push(task);
          } else {
            acc.push({
              id: homework.subject_id,
              subject: homework.subject_name,
              tasks: [task],
            });
          }
          return acc;
        }, []);

        setChildHomework(groupedHomework);
      }
    } catch (error) {
      console.error("获取作业数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取待新增任务
  const fetchPendingTasks = async () => {
    try {
      // 显示加载状态
      setIsLoading(true);

      console.log("获取待审批新增任务");

      // 调用API获取待处理任务
      const response = await get(
        `/api/task/pending?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedTasks = result.data.map((task) => ({
          id: task.id,
          childName: selectedChild?.name || "未知",
          title: task.name,
          points: task.integral || 0,
          status: "pending",
          createdAt:
            task.create_time ||
            new Date().toISOString().slice(0, 16).replace("T", " "),
        }));

        setPendingTasks(formattedTasks);
      } else {
        console.error("获取待处理任务失败:", result.message);
      }
    } catch (error) {
      console.error("获取待处理任务数据出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取已完成任务
  const fetchCompletedTasks = async () => {
    try {
      setIsLoading(true);

      console.log("获取已完成任务");

      const response = await get(
        `/api/task/complete?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        const formattedTasks = result.data.map((task) => ({
          id: task.id,
          childName: selectedChild?.name || "未知",
          title: task.name,
          points: task.integral || 0,
          status: "completed",
          completedAt:
            task.complete_time ||
            new Date().toISOString().slice(0, 16).replace("T", " "),
        }));

        setCompletedTasks(formattedTasks);
      } else {
        console.error("获取已完成任务失败:", result.message);
      }
    } catch (error) {
      console.error("获取已完成任务数据出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取孩子任务
  const fetchChildTasks = async () => {
    try {
      setIsLoading(true);
      console.log("获取孩子任务");

      const response = await get(
        `/api/task/parent?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedTasks = result.data.map((task) => ({
          id: task.id,
          title: task.name,
          points: task.integral || 0,
          completed: task.is_complete === "1",
          time: task.create_time
            ? new Date(task.create_time).toLocaleDateString("zh-CN", {
                month: "numeric",
                day: "numeric",
              }) + "日"
            : "今天",
        }));

        setChildTasks(formattedTasks);
      } else {
        console.error("获取孩子任务列表失败:", result.message);
        setChildTasks([]);
      }
    } catch (error) {
      console.error("获取孩子任务数据出错:", error);
      setChildTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取奖励列表
  const fetchRewards = async () => {
    try {
      setIsLoadingRewards(true);

      // 使用封装的get方法获取奖励数据
      const response = await get("/api/reward");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据设置到状态中
        setRewards(
          result.data.map((reward) => ({
            id: reward.id,
            title: reward.name,
            points: reward.integral || 0,
            image: reward.pic
              ? reward.pic_ext
                ? `data:image/${reward.pic_ext};base64,${reward.pic}`
                : reward.pic
              : "/placeholder.svg?height=80&width=80",
            family_id: reward.family_id,
          }))
        );
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

  // 获取待审核奖励
  const fetchPendingRewards = async () => {
    try {
      setIsLoading(true);
      console.log("获取待审核奖励");

      // 调用API获取待审核奖励
      const response = await get(
        `/api/reward/history?childId=${selectedChild.id}`
      );
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedRewards = result.data.map((reward) => ({
          id: reward.id,
          childName: reward.child_name || selectedChild?.name || "未知",
          rewardTitle: reward.reward_name || "未知奖励",
          points: reward.reward_integral || 0,
          status: "pending",
          requestedAt:
            reward.created_at ||
            new Date().toISOString().slice(0, 16).replace("T", " "),
        }));

        setPendingRewards(formattedRewards);
      } else {
        console.error("获取待审核奖励失败:", result.message);
        setPendingRewards([]);
      }
    } catch (error) {
      console.error("获取待审核奖励数据出错:", error);
      setPendingRewards([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取积分历史记录的函数
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);

      // 使用封装的get方法获取积分历史数据
      const response = await get(`/api/history/parent?childId=${selectedChild.id}`);
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据格式化为组件需要的格式
        const formattedHistory = result.data.map(item => ({
          id: item.id,
          childName: selectedChild?.name || "未知",
          title: item.name,
          points: item.integral || 0,
          type: ["01", "02", "03"].includes(item.integral_type) ? "earn" : "spend",
          date: item.integral_date
        }));
        
        setHistory(formattedHistory);
        console.log("获取积分历史记录成功:", formattedHistory);
      } else {
        console.error("获取积分历史记录失败:", result.message);
      }
    } catch (error) {
      console.error("获取积分历史记录出错:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };  

  // 页面加载时获取数据
  useEffect(() => {
    // 首先获取孩子列表
    fetchChildrenList();
    // 获取截止时间设置
    fetchDeadlineSettings();
    // 获取科目列表
    fetchSubjects();
    // 获取奖励列表
    fetchRewards();
  }, []);

  // 当选择的孩子ID变化时，重新获取相关数据
  useEffect(() => {
    if (selectedChild) {
      // 添加selectedChild检查
      // 获取待处理作业
      fetchPendingHomeworks();
      // 获取已完成作业
      fetchCompletedHomeworks();
      // 获取作业数据
      fetchChildHomeworks();
      // 获取待处理任务
      fetchPendingTasks();
      // 获取已完成任务
      fetchCompletedTasks();
      // 获取孩子任务列表
      fetchChildTasks();
      // 获取待审核奖励
      fetchPendingRewards();
      // 获取积分历史记录
      fetchHistory();
    }
  }, [selectedChild]); // 添加selectedChild依赖

  useEffect(() => {
    const fetchChild = async () => {
      try {
        console.log("获取孩子信息");
        const response = await get(`/api/family/children/${selectedChildId}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
          setChildPoints({
            total: result.data.total,
            thisWeek: result.data.thisWeek,
            thisWeekSpent: result.data.thisWeekSpent,
          });
          console.log(result.data);
          setSelectedChild(result.data); // 保存完整的孩子信息
        }
      } catch (error) {
        console.error("获取孩子积分信息失败:", error);
      }
    };

    if (selectedChildId) {
      fetchChild();
    }
  }, [selectedChildId]);

  // 获取孩子列表
  const fetchChildrenList = async () => {
    try {
      setIsLoading(true);

      // 调用API获取孩子列表
      const response = await get("/api/family/children");
      const result = await response.json();

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedChildren = result.data.map((child) => ({
          id: child.id,
          name: child.name || `孩子${child.id}`,
        }));

        setChildrenList(formattedChildren);

        // 如果有孩子，默认选择第一个
        if (formattedChildren.length > 0) {
          setSelectedChildId(formattedChildren[0].id); // 设置默认选中的孩子ID
        }
      } else {
        console.error("获取孩子列表失败:", result.message);
      }
    } catch (error) {
      console.error("获取孩子列表数据出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHomework = (newHomework) => {
    try {
      if (editingHomework) {
        console.log("修改作业:", newHomework);

        // 首先更新本地UI状态
        setPendingHomework(
          pendingHomework.map((item) =>
            item.id === editingHomework.id ? { ...item, ...newHomework } : item
          )
        );

        // 设置加载状态
        setIsLoading(true);

        // 调用API保存修改到服务器
        (async () => {
          try {
            // 准备要发送的数据
            const homeworkData = {
              id: editingHomework.id,
              // 可以添加其他需要更新的字段
              name: newHomework.name,
              subject_id: newHomework.subject_id,
              duration: newHomework.duration,
              deadline: newHomework.deadline,
              integral: newHomework.points,
            };

            // 调用POST接口保存修改
            const response = await put("/api/homework/parent", homeworkData);
            const result = await response.json();

            if (result.code === 200) {
              console.log("作业修改成功:", result.data);
              // 刷新数据以确保显示最新状态
              // fetchPendingHomeworks();
            } else {
              console.error("作业修改失败:", result.message);
              alert(`修改失败: ${result.message || "未知错误"}`);
            }
          } catch (error) {
            console.error("作业修改请求失败:", error);
            alert(`修改请求失败: ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        })();

        setEditingHomework(null);
      } else {
        console.log("添加新作业:", newHomework);

        // 设置加载状态
        setIsLoading(true);

        // 异步函数处理API调用
        (async () => {
          try {
            // 准备API请求数据
            const homeworkData = {
              name: newHomework.name,
              subject_id: newHomework.subject_id,
              estimated_duration: parseInt(newHomework.duration) || null,
              deadline: newHomework.deadline
                ? `${new Date().toISOString().split("T")[0]} ${
                    newHomework.deadline
                  }`
                : null,
              integral: parseInt(newHomework.points) || 0,
              homework_date: new Date().toISOString().split("T")[0],
              child_id: selectedChild.id, // 添加孩子ID，家长版本需要指定哪个孩子
            };

            // 调用API添加作业
            const response = await post("/api/homework/parent", homeworkData);
            const result = await response.json();

            if (result.code === 200 && result.data) {
              console.log("作业添加成功:", result.data);

              // 添加成功后刷新作业列表
              fetchChildHomeworks();
            } else {
              console.error("添加作业失败:", result.message);
              alert(`添加失败: ${result.message || "未知错误"}`);
            }
          } catch (error) {
            console.error("添加作业出错:", error);
            alert(`添加作业失败: ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    } catch (error) {
      alert("操作失败：" + error.message);
      setIsLoading(false);
    }
  };

  const handleEditHomework = (item) => {
    setEditingHomework(item);
    setIsAddHomeworkOpen(true);
  };

  // 添加删除作业的函数
  const deleteHomework = async (subjectId, taskId) => {
    try {
      if (!confirm("确定要删除这个作业吗？此操作不可撤销。")) {
        return;
      }

      // 调用API删除作业
      const response = await del(`/api/homework/parent`, {
        body: JSON.stringify({ id: taskId })
      });

      const result = await response.json();

      if (result.code === 200) {
        // 更新本地状态，移除被删除的作业
        setChildHomework(
          childHomework
            .map((subject) => {
              if (subject.id === subjectId) {
                return {
                  ...subject,
                  tasks: subject.tasks.filter((task) => task.id !== taskId),
                };
              }
              return subject;
            })
            .filter((subject) => subject.tasks.length > 0)
        );

        console.log("作业删除成功");
      } else {
        console.error("删除作业失败:", result.message);
        alert(`删除失败: ${result.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("删除作业出错:", error);
      alert("删除作业时出错，请稍后再试");
    }
  };

  const handleEditTask = (item) => {
    setEditingTask(item);
    setIsAddTaskOpen(true);
  };

  const handleAddTask = (newTask) => {
    try {
      if (editingTask) {
        console.log("修改任务:", newTask);

        // 首先更新本地UI状态
        setPendingTasks(
          pendingTasks.map((item) =>
            item.id === editingTask.id ? { ...item, ...newTask } : item
          )
        );

        // 设置加载状态
        setIsLoading(true);

        // 调用API保存修改到服务器
        (async () => {
          try {
            // 准备要发送的数据
            const taskData = {
              id: editingTask.id,
              name: newTask.title,
              integral: newTask.points,
            };

            // 调用POST接口保存修改
            const response = await post("/api/task/pending", taskData);
            const result = await response.json();

            if (result.code === 200) {
              console.log("任务修改成功:", result.data);
              // 刷新数据以确保显示最新状态
              fetchPendingTasks();
            } else {
              console.error("任务修改失败:", result.message);
              alert(`修改失败: ${result.message || "未知错误"}`);
            }
          } catch (error) {
            console.error("任务修改请求失败:", error);
            alert(`修改请求失败: ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        })();

        setEditingTask(null);
      } else {
        console.log("添加新任务:", newTask);

        // 设置加载状态
        setIsLoading(true);

        // 异步函数处理API调用
        (async () => {
          try {
            // 准备API请求数据
            const taskData = {
              name: newTask.title,
              integral: parseInt(newTask.points) || 0,
              child_id: selectedChild.id, // 添加孩子ID，家长版本需要指定哪个孩子
              task_date: new Date().toISOString().split("T")[0],
            };

            // 调用API添加任务
            const response = await post("/api/task/parent", taskData);
            const result = await response.json();

            if (result.code === 200 && result.data) {
              console.log("任务添加成功:", result.data);

              // 添加成功后刷新任务列表
              fetchChildTasks();
            } else {
              console.error("添加任务失败:", result.message);
              alert(`添加失败: ${result.message || "未知错误"}`);
            }
          } catch (error) {
            console.error("添加任务出错:", error);
            alert(`添加任务失败: ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    } catch (error) {
      alert("操作失败：" + error.message);
    }
  };

  const handleAddReward = (newReward) => {
    console.log("添加新奖励:", newReward);

    // 设置加载状态
    setIsLoading(true);

    // 异步函数处理API调用
    (async () => {
      try {
        // 准备API请求数据
        const rewardData = {
          name: newReward.title,
          integral: parseInt(newReward.points) || 0,
          // pic: newReward.image || null,
          // pic_ext: newReward.pic_ext || null,
        };

        // 调用API添加奖励
        const response = await post("/api/reward/parent", rewardData);
        const result = await response.json();

        if (result.code === 200 && result.data) {
          console.log("奖励添加成功:", result.data);

          // 添加成功后刷新奖励列表
          fetchRewards();

          alert("奖励添加成功！");
        } else {
          console.error("添加奖励失败:", result.message);
          alert(`添加失败: ${result.message || "未知错误"}`);
        }
      } catch (error) {
        console.error("添加奖励出错:", error);
        alert(`添加奖励失败: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const openApprovalDialog = (item, type) => {
    setApprovalItem(item);
    setApprovalType(type);
    setApprovalDialogOpen(true);
  };

  // 处理作业添加审批
  const handleHomeworkAddApproval = async (approved) => {
    if (approved) {
      try {
        setIsLoading(true);
        const response = await put(`/api/homework/pending`, {
          id: approvalItem.id,
        });

        const result = await response.json();

        if (result.code === 200) {
          setPendingHomework(
            pendingHomework.filter((item) => item.id !== approvalItem.id)
          );
          console.log("作业审批成功:", approvalItem.title);
          fetchPendingHomeworks();
        } else {
          console.error("作业审批失败:", result.message);
          alert(`审批失败: ${result.message || "未知错误"}`);
        }
      } catch (error) {
        console.error("作业审批请求出错:", error);
        alert(`审批请求出错: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("作业被拒绝:", approvalItem.title);
      setPendingHomework(
        pendingHomework.filter((item) => item.id !== approvalItem.id)
      );
    }
  };

  // 处理作业完成审批
  const handleHomeworkCompleteApproval = async (approved, wrongAnswers = 0) => {
    try {
      setIsLoading(true);
      const response = await put(`/api/homework/complete`, {
        id: approvalItem.id,
        incorrect: wrongAnswers || 0,
        approved: approved,
      });

      const result = await response.json();

      if (result.code === 200) {
        // const updatedCompletedHomework = completedHomework.filter(
        //   (item) => item.id !== approvalItem.id
        // );
        // setCompletedHomework(updatedCompletedHomework);

        if (approved) {
          updateHomeworkStatusAfterCompletion(wrongAnswers);
          // addHomeworkCompletionToHistory(wrongAnswers);
          updatePointsAfterHomeworkCompletion();
        } else {
          console.log(`作业 ${approvalItem.title} 被拒绝`);
        }
        
      } else {
        console.error("作业完成审批失败:", result.message);
        // alert(`审批失败: ${result.message || "未知错误"}`);
      }

      fetchCompletedHomeworks();
      fetchChildHomeworks();
    } catch (error) {
      console.error("作业完成审批请求出错:", error);
      // alert(`审批请求出错: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新作业完成后的状态
  const updateHomeworkStatusAfterCompletion = (wrongAnswers) => {
    setChildHomework(
      childHomework.map((subject) => {
        if (subject.subject === approvalItem.subject) {
          return {
            ...subject,
            tasks: subject.tasks.map((task) => {
              if (task.title === approvalItem.title) {
                return {
                  ...task,
                  completed: true,
                  wrongAnswers: wrongAnswers || 0,
                };
              }
              return task;
            }),
          };
        }
        return subject;
      })
    );

    console.log(
      `作业 ${approvalItem.title} 完成，错题数量: ${wrongAnswers}`
    );
  };

  // 添加作业完成到历史记录
  const addHomeworkCompletionToHistory = (wrongAnswers) => {
    setHistory([
      {
        id: Date.now(),
        childName: approvalItem.childName,
        title: `完成${approvalItem.subject}作业: ${approvalItem.title}`,
        points: approvalItem.points,
        type: "earn",
        date: new Date().toISOString().split("T")[0],
        wrongAnswers: wrongAnswers,
      },
      ...history,
    ]);
  };

  // 更新作业完成后的积分
  const updatePointsAfterHomeworkCompletion = () => {
    setChildPoints({
      ...childPoints,
      total: childPoints.total + approvalItem.points,
      thisWeek: childPoints.thisWeek + approvalItem.points,
    });
  };

  // 处理任务添加审批
  const handleTaskAddApproval = async (approved) => {
    if (approved) {
      try {
        setIsLoading(true);
        const response = await put(`/api/task/pending`, {
          id: approvalItem.id,
        });

        const result = await response.json();

        if (result.code === 200) {
          setPendingTasks(
            pendingTasks.filter((item) => item.id !== approvalItem.id)
          );
          console.log("任务审批成功:", approvalItem.title);
          fetchPendingTasks();
        } else {
          console.error("任务审批失败:", result.message);
          alert(`审批失败: ${result.message || "未知错误"}`);
        }
      } catch (error) {
        console.error("任务审批请求出错:", error);
        alert(`审批请求出错: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        // 调用DELETE接口删除被拒绝的任务
        const response = await del(`/api/task/parent`, {
          body: JSON.stringify({ id: approvalItem.id })
        });

        const result = await response.json();

        if (result.code === 200) {
          console.log("任务被拒绝并成功删除:", approvalItem.title);
          // 删除任务
          fetchChildTasks();
        } else {
          console.error("任务被拒绝但删除失败:", result.message);
        }
      } catch (error) {
        console.error("任务拒绝删除请求出错:", error);
      } finally {
        setIsLoading(false);
        // 无论API调用成功与否，都从前端列表中移除该任务
        setPendingTasks(
          pendingTasks.filter((item) => item.id !== approvalItem.id)
        );
      }
    }
  };

  // 处理任务完成审批
  const handleTaskCompleteApproval = async (approved) => {
    try {
      setIsLoading(true);
      const response = await put(`/api/task/complete`, {
        id: approvalItem.id,
        approved: approved,
      });

      const result = await response.json();

      console.log("任务完成审批结果:", result);

      if (result.code === 200) {

        if (approved) {
          // addTaskCompletionToHistory();
          updatePointsAfterTaskCompletion();
          console.log("任务完成审批成功:", approvalItem.title);
        } else {
          console.log("任务完成被拒绝:", approvalItem.title);
        }
      } else {
        console.error("任务完成审批失败:", result?.message || "未知错误");
      }
      fetchCompletedTasks();
    } catch (error) {
      console.error("任务完成审批请求出错:", error);
      alert(`审批请求出错: ${error?.message || "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加任务完成到历史记录
  const addTaskCompletionToHistory = () => {
    setHistory([
      {
        id: Date.now(),
        childName: approvalItem.childName,
        title: `完成任务: ${approvalItem.title}`,
        points: approvalItem.points,
        type: "earn",
        date: new Date().toISOString().split("T")[0],
      },
      ...history,
    ]);
  };

  // 更新任务完成后的积分
  const updatePointsAfterTaskCompletion = () => {
    setChildPoints({
      ...childPoints,
      total: childPoints.total + approvalItem.points,
      thisWeek: childPoints.thisWeek + approvalItem.points,
    });
  };

  // 处理奖励兑换审批
  const handleRewardRedeemApproval = async (approved) => {
    try {
      setIsLoading(true);
      const response = await put(`/api/reward/history`, {
        id: approvalItem.id,
        approved: approved ? "1" : "2", // 转换为字符串
      });

      const result = await response.json();

      if (result.code === 200) {
        console.log("奖励兑换审批成功:", result.data);
        
        if (approved) {
          setPendingRewards(
            pendingRewards.filter((item) => item.id !== approvalItem.id)
          );
          addRewardRedemptionToHistory();
          updatePointsAfterRewardRedemption();
        }
        
        fetchPendingRewards();
      } else {
        console.error("奖励兑换审批失败:", result.message);
        alert(`审批失败: ${result.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("奖励兑换审批请求出错:", error);
      alert(`审批请求出错: ${error.message || "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加奖励兑换到历史记录
  const addRewardRedemptionToHistory = () => {
    setHistory([
      {
        id: Date.now(),
        childName: approvalItem.childName,
        title: `兑换奖励: ${approvalItem.rewardTitle}`,
        points: approvalItem.points,
        type: "spend",
        date: new Date().toISOString().split("T")[0],
      },
      ...history,
    ]);
  };

  // 更新奖励兑换后的积分
  const updatePointsAfterRewardRedemption = () => {
    setChildPoints({
      ...childPoints,
      total: childPoints.total - approvalItem.points,
      thisWeekSpent: childPoints.thisWeekSpent + approvalItem.points,
    });
  };

  // 处理审批的主函数
  const handleApproval = async (approved, wrongAnswers = 0) => {
    switch (approvalType) {
      case "homework-add":
        await handleHomeworkAddApproval(approved);
        break;
      case "homework-complete":
        await handleHomeworkCompleteApproval(approved, wrongAnswers);
        break;
      case "task-add":
        await handleTaskAddApproval(approved);
        break;
      case "task-complete":
        await handleTaskCompleteApproval(approved);
        break;
      case "reward-redeem":
        await handleRewardRedeemApproval(approved);
        break;
      default:
        console.error("未知的审批类型:", approvalType);
    }

    setApprovalDialogOpen(false);
    setApprovalItem(null);
  };

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

  const handleSaveDeadlineSettings = async (settings) => {
    try {
      console.log("保存截止时间设置:", settings);

      // 构建请求数据
      const deadlineData = {
        is_deadline: settings.enabled ? "1" : "0",
        deadline: settings.time,
        integral: settings.bonusPoints,
      };

      // 调用API保存设置
      const response = await put("/api/family/deadline", deadlineData);
      const result = await response.json();

      if (result.code === 200) {
        setDeadlineSettings(settings);
        console.log("截止时间设置保存成功");
      } else {
        console.error("保存截止时间设置失败:", result.message);
      }
    } catch (error) {
      console.error("保存截止时间设置出错:", error);
    }
  };

  const handleHomeworkDateSelect = async (date) => {
    setSelectedHomeworkDate(date);

    // 使用本地日期格式，避免时区问题
    // 创建一个新的日期对象避免修改原始对象
    const localDate = new Date(date);

    // 格式化为YYYY-MM-DD格式
    const formattedDate =
      localDate.getFullYear() +
      "-" +
      String(localDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(localDate.getDate()).padStart(2, "0");

    console.log("选择的作业日期:", formattedDate);

    try {
      // 显示加载状态
      setIsLoading(true);

      // 如果没有选中的孩子，则返回
      if (!selectedChild || !selectedChild.id) {
        console.error("未选择孩子");
        return;
      }

      // 调用API获取该日期的作业数据
      const apiUrl = `/api/homework/parent?childId=${selectedChild.id}&homeworkDate=${formattedDate}`;
      console.log("API请求URL:", apiUrl);

      const response = await get(apiUrl);
      const result = await response.json();

      console.log("API响应:", result);

      if (result.code === 200 && result.data) {
        // 将API返回的数据按科目分组
        const groupedHomework = result.data.reduce((acc, homework) => {
          const subject = acc.find((s) => s.id === homework.subject_id);
          const task = {
            id: homework.id,
            title: homework.name,
            duration: `${homework.estimated_duration}分钟`,
            points: homework.integral || 0,
            completed: homework.is_complete === "1",
            deadline: homework.deadline?.split(" ")[1] || "",
            wrongAnswers: homework.incorrect || 0,
          };

          if (subject) {
            subject.tasks.push(task);
          } else {
            acc.push({
              id: homework.subject_id,
              subject: homework.subject_name,
              tasks: [task],
            });
          }
          return acc;
        }, []);

        setChildHomework(groupedHomework);
        console.log(
          `已获取${formattedDate}的作业数据，共${result.data.length}条记录`
        );
      } else {
        console.error("获取作业数据失败:", result.message);

        // 如果API调用失败或无数据，设置空的作业列表
        setChildHomework([]);
      }
    } catch (error) {
      console.error("获取作业数据出错:", error);
      // 出错时设置空的作业列表
      setChildHomework([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskDateSelect = async (date) => {
    setSelectedTaskDate(date);

    // 使用本地日期格式，避免时区问题
    // 创建一个新的日期对象避免修改原始对象
    const localDate = new Date(date);

    // 格式化为YYYY-MM-DD格式
    const formattedDate =
      localDate.getFullYear() +
      "-" +
      String(localDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(localDate.getDate()).padStart(2, "0");

    console.log("选择的任务日期:", formattedDate);

    try {
      // 显示加载状态
      setIsLoading(true);

      // 如果没有选中的孩子，则返回
      if (!selectedChild || !selectedChild.id) {
        console.error("未选择孩子");
        return;
      }

      // 调用API获取该日期的任务数据
      const apiUrl = `/api/task/parent?childId=${selectedChild.id}&taskDate=${formattedDate}`;
      console.log("API请求URL:", apiUrl);

      const response = await get(apiUrl);
      const result = await response.json();

      console.log("API响应:", result);

      if (result.code === 200 && result.data) {
        // 将API返回的数据转换为组件需要的格式
        const formattedTasks = result.data.map((task) => ({
          id: task.id,
          title: task.name,
          points: task.integral || 0,
          completed: task.is_complete === "1",
          time:
            formattedDate === new Date().toISOString().split("T")[0]
              ? "今天"
              : localDate.getMonth() + 1 + "月" + localDate.getDate() + "日",
        }));

        setChildTasks(formattedTasks);
        console.log(
          `已获取${formattedDate}的任务数据，共${result.data.length}条记录`
        );
      } else {
        console.error("获取任务数据失败:", result.message);

        // 如果API调用失败或无数据，设置空的任务列表
        setChildTasks([]);
      }
    } catch (error) {
      console.error("获取任务数据出错:", error);
      // 出错时设置空的任务列表
      setChildTasks([]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen p-3 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col gap-3 mb-4 sm:mb-6 sm:gap-4">
          <div className="flex flex-col items-start justify-between gap-3 p-3 border-2 shadow-lg rounded-2xl backdrop-blur-sm sm:flex-row sm:items-center sm:gap-0 bg-white/90 sm:p-4 border-white/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse blur"></div>
                <Avatar className="relative w-12 h-12 border-2 border-white">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="text-white bg-gradient-to-r from-blue-400 to-purple-400">
                    家长
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  你好，家长！
                </h2>
                <p className="text-gray-600">欢迎使用家长管理界面</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-3">
                <User className="w-5 h-5 text-blue-500" />
                <Select
                  value={
                    childrenList.find((child) => child.id === selectedChildId)
                      ?.name || ""
                  }
                  onValueChange={(value) => {
                    // 根据选择的名字查找对应的孩子ID
                    const selectedChild = childrenList.find(
                      (child) => child.name === value
                    );
                    if (selectedChild) {
                      setSelectedChildId(selectedChild.id);

                      // 重新加载相关数据
                      fetchPendingHomeworks();
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px] bg-blue-50 border-blue-200">
                    <SelectValue
                      placeholder={isLoading ? "加载中..." : "选择小朋友"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {childrenList.length > 0 ? (
                      childrenList.map((child) => (
                        <SelectItem key={child.id} value={child.name}>
                          {child.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="无数据" disabled>
                        暂无小朋友数据
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
            <div className="p-4 border-2 shadow-lg bg-gradient-to-br rounded-2xl from-green-400/90 to-teal-500/90 border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm bg-white/20">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      作业截止时间
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {deadlineSettings.enabled
                        ? deadlineSettings.time
                        : "未启用"}
                    </h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsDeadlineSettingsOpen(true)}
                >
                  设置
                </Button>
              </div>
            </div>

            <div className="p-4 border-2 shadow-lg bg-gradient-to-br rounded-2xl from-yellow-400/90 to-amber-500/90 border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm bg-white/20">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {selectedChild?.name}的总积分
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {childPoints.total}
                    </h3>
                  </div>
                </div>
                <Award className="w-12 h-12 text-white/20" />
              </div>
            </div>

            <div className="p-4 border-2 shadow-lg bg-gradient-to-br rounded-2xl from-blue-400/90 to-cyan-500/90 border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm bg-white/20">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      本周获得积分
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {childPoints.thisWeek}
                    </h3>
                  </div>
                </div>
                <Star className="w-12 h-12 text-white/20" />
              </div>
            </div>

            <div className="p-4 border-2 shadow-lg bg-gradient-to-br rounded-2xl from-purple-400/90 to-pink-500/90 border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm bg-white/20">
                    <History className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      本周消耗积分
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {childPoints.thisWeekSpent}
                    </h3>
                  </div>
                </div>
                <Gift className="w-12 h-12 text-white/20" />
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="homework" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 p-1 text-xs shadow-xl rounded-xl bg-white/80 sm:text-sm md:text-lg">
            <TabsTrigger
              value="homework"
              className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <PenLine className="w-5 h-5 mr-2" />
                <span>作业</span>
                {pendingHomework.length > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {pendingHomework.length}
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
                {pendingTasks.length > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {pendingTasks.length}
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
                <span>兑奖</span>
                {pendingRewards.length > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {pendingRewards.length}
                  </span>
                )}
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
                    作业管理
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsAddHomeworkOpen(true)}
                      className="rounded-full bg-gradient-to-r to-purple-600 from-primary"
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
                    <Button
                      size="sm"
                      className="text-white rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                      onClick={() => setShowStatistics(!showStatistics)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {showStatistics ? "隐藏统计" : "查看统计"}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  管理小朋友的作业，审批作业添加和完成
                </CardDescription>
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
                {showStatistics && (
                  <div className="mt-4 mb-6">
                    <div className="p-4 border-2 border-purple-100 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-purple-700">
                          作业统计分析
                        </h3>
                      </div>
                      <HomeworkStatistics>
                        {[
                          { id: 1, name: "小明" },
                          { id: 2, name: "小红" },
                        ]}
                      </HomeworkStatistics>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  <div className="p-4 border-2 bg-amber-50 rounded-xl border-amber-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
                        <ClipboardCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-700">
                        待审批新增作业
                      </h3>
                    </div>

                    {pendingHomework.length > 0 ? (
                      <div className="space-y-3">
                        {pendingHomework.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col p-3 bg-white border rounded-lg border-amber-200 sm:flex-row sm:items-center sm:justify-between hover:border-amber-300 hover:bg-amber-50"
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {item.childName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {item.subject}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {item.duration}分钟
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditHomework(item)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                修改
                              </Button>
                              <Badge
                                variant="outline"
                                className="flex gap-1 border-yellow-300 bg-yellow-50"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span>{item.points}</span>
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openApprovalDialog(item, "homework-add")
                                }
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              >
                                审批
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white border border-dashed rounded-lg border-amber-200">
                        <p className="text-muted-foreground">暂无待审批作业</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-2 border-green-100 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-700">
                        待审批完成作业
                      </h3>
                    </div>

                    {completedHomework.length > 0 ? (
                      <div className="space-y-3">
                        {completedHomework.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col p-3 bg-white border border-green-200 rounded-lg sm:flex-row sm:items-center sm:justify-between hover:border-green-300 hover:bg-green-50"
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {item.childName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {item.subject}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {item.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                              <Badge
                                variant="outline"
                                className="flex gap-1 border-yellow-300 bg-yellow-50"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span>{item.points}</span>
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openApprovalDialog(item, "homework-complete")
                                }
                                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                              >
                                审批完成
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white border border-green-200 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                          暂无待审批完成作业
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 mt-6 border-2 border-blue-100 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-700">
                        {selectedChild?.name}的作业列表
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {childHomework.map((subject) => (
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
                                    <h4 className="font-medium">
                                      {task.title}
                                    </h4>
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
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteHomework(subject.id, task.id)}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <div className="flex gap-2"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 mt-6 border-2 border-green-100 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-700">
                        作业完成进度
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {childHomework.map((subject) => {
                        const totalTasks = subject.tasks.length;
                        const completedTasks = subject.tasks.filter(
                          (t) => t.completed
                        ).length;
                        const progress = (completedTasks / totalTasks) * 100;

                        return (
                          <div key={subject.id} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {subject.subject}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {completedTasks}/{totalTasks}
                              </span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-3 rounded-full bg-gradient-to-r from-blue-200 to-purple-200"
                              indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                            {/* 在 Progress 组件后添加错题统计 */}
                            <div className="flex justify-between mt-1 text-xs">
                              <span className="text-gray-500">
                                总错题:{" "}
                                {(() => {
                                  // 为单个科目计算错题统计
                                  const totalWrongAnswers =
                                    subject.tasks.reduce(
                                      (sum, t) => sum + (t.wrongAnswers || 0),
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
                                  const totalWrongAnswers =
                                    subject.tasks.reduce(
                                      (sum, t) => sum + (t.wrongAnswers || 0),
                                      0
                                    );
                                  return subject.tasks.length > 0
                                    ? (
                                        totalWrongAnswers / subject.tasks.length
                                      ).toFixed(1)
                                    : "0.0";
                                })()}
                                个/题
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 mt-6 border-2 border-amber-100 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-700">
                        错题统计
                      </h3>
                    </div>

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
                            {
                              calculateWrongAnswersStats(childHomework)
                                .totalWrongAnswers
                            }
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
                            {
                              calculateWrongAnswersStats(childHomework)
                                .avgWrongAnswers
                            }
                          </div>
                          <span className="text-xl">📊</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">科目错题分布</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {childHomework.map((subject) => {
                            const subjectWrongAnswers = subject.tasks.reduce(
                              (sum, task) =>
                                sum +
                                (task.completed ? task.wrongAnswers || 0 : 0),
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="overflow-hidden bg-white border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <BookOpen className="w-6 h-6 mr-2 text-primary" />
                    {selectedTaskDate.toLocaleDateString("zh-CN", {
                      month: "long",
                      day: "numeric",
                    })}
                    任务管理
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsAddTaskOpen(true)}
                      className="rounded-full bg-gradient-to-r to-purple-600 from-primary"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加任务
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowTaskCalendar(!showTaskCalendar)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {showTaskCalendar ? "隐藏日历" : "查看日历"}
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
                <CardDescription>
                  管理小朋友的日常任务，审批任务添加和完成
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {showTaskCalendar && (
                  <div className="mb-6">
                    <TaskCalendar
                      selectedDate={selectedTaskDate}
                      onDateSelect={handleTaskDateSelect}
                    />
                  </div>
                )}
                <div className="space-y-6">
                  <div className="p-4 border-2 bg-amber-50 rounded-xl border-amber-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
                        <ClipboardCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-700">
                        待审批新增任务
                      </h3>
                    </div>

                    {isLoading ? (
                      <div className="p-6 text-center bg-white border border-dashed rounded-lg border-amber-200">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-4 rounded-full animate-spin border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                          <p className="mt-2 text-muted-foreground">
                            正在加载数据...
                          </p>
                        </div>
                      </div>
                    ) : pendingTasks.length > 0 ? (
                      <div className="space-y-3">
                        {pendingTasks.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col p-3 bg-white border rounded-lg border-amber-200 sm:flex-row sm:items-center sm:justify-between hover:border-amber-300 hover:bg-amber-50"
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {item.childName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {item.createdAt}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTask(item)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                修改
                              </Button>
                              <Badge
                                variant="outline"
                                className="flex gap-1 border-yellow-300 bg-yellow-50"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span>{item.points}</span>
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openApprovalDialog(item, "task-add")
                                }
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              >
                                审批
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white border border-dashed rounded-lg border-amber-200">
                        <p className="text-muted-foreground">暂无待审批任务</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-2 border-green-100 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-700">
                        待审批完成任务
                      </h3>
                    </div>

                    {completedTasks.length > 0 ? (
                      <div className="space-y-3">
                        {completedTasks.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col p-3 bg-white border border-green-200 rounded-lg sm:flex-row sm:items-center sm:justify-between hover:border-green-300 hover:bg-green-50"
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {item.childName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {item.completedAt}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                              <Badge
                                variant="outline"
                                className="flex gap-1 border-yellow-300 bg-yellow-50"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span>{item.points}</span>
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openApprovalDialog(item, "task-complete")
                                }
                                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                              >
                                审批完成
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white border border-green-200 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                          暂无待审批完成任务
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 mt-6 border-2 border-blue-100 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-700">
                        {selectedChild?.name}的任务列表
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {childTasks.map((task) => (
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
                                task.completed
                                  ? "bg-green-500"
                                  : "bg-primary/20"
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 mt-6 border-2 border-green-100 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-700">
                        小朋友的成就进度
                      </h3>
                    </div>

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
                          <span className="text-sm text-muted-foreground">
                            3/5
                          </span>
                        </div>
                        <Progress value={60} className="h-3 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card className="overflow-hidden bg-white border-2 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-pink-400/20 via-orange-400/20 to-yellow-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <Gift className="w-6 h-6 mr-2 text-primary" />
                    奖励管理
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsAddRewardOpen(true)}
                      className="rounded-full bg-gradient-to-r to-purple-600 from-primary"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加奖励
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  管理奖励项目，审批小朋友的兑换请求
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="p-4 border-2 bg-amber-50 rounded-xl border-amber-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
                        <ClipboardCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-700">
                        待审批兑换
                      </h3>
                    </div>

                    {pendingRewards.length > 0 ? (
                      <div className="space-y-3">
                        {pendingRewards.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col p-3 bg-white border rounded-lg border-amber-200 sm:flex-row sm:items-center sm:justify-between hover:border-amber-300 hover:bg-amber-50"
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                                <Gift className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {item.rewardTitle}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {item.childName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {item.requestedAt}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                              <Badge
                                variant="outline"
                                className="flex gap-1 border-yellow-300 bg-yellow-50"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span>{item.points}</span>
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openApprovalDialog(item, "reward-redeem")
                                }
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              >
                                审批兑换
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white border border-dashed rounded-lg border-amber-200">
                        <p className="text-muted-foreground">暂无待审批兑换</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-2 border-blue-100 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <Gift className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-700">
                        当前奖励列表
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                      {rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex flex-col overflow-hidden transition-all border-2 bg-gradient-to-br from-white to-purple-50 rounded-xl border-primary/20 hover:border-primary/50 hover:shadow-xl"
                        >
                          <div className="flex items-center gap-4 p-4">
                            <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10">
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="overflow-hidden border-2 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-400/20 via-teal-400/20 to-green-400/20">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                  <CardTitle className="flex items-center text-2xl">
                    <History className="w-6 h-6 mr-2 text-primary" />
                    积分记录
                  </CardTitle>
                </div>
                <CardDescription>查看积分获取和使用历史</CardDescription>
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {item.childName}
                                </span>
                                <span className="text-muted-foreground">|</span>
                                <span>{item.date}</span>
                                {item.wrongAnswers !== undefined && (
                                  <>
                                    <span className="text-muted-foreground">
                                      |
                                    </span>
                                    <span
                                      className={
                                        item.wrongAnswers > 0
                                          ? "text-amber-600"
                                          : "text-green-600"
                                      }
                                    >
                                      错题: {item.wrongAnswers}
                                    </span>
                                  </>
                                )}
                              </div>
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
      </div>

      <AddHomeworkDialog
        isOpen={isAddHomeworkOpen}
        onClose={() => {
          setIsAddHomeworkOpen(false);
          setEditingHomework(null);
        }}
        onAdd={handleAddHomework}
        initialData={editingHomework}
        subjects={subjects}
      />

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setEditingTask(null);
        }}
        onAdd={handleAddTask}
        initialData={editingTask}
        childrenList={childrenList}
      />

      <AddRewardDialog
        isOpen={isAddRewardOpen}
        onClose={() => setIsAddRewardOpen(false)}
        onAdd={handleAddReward}
      />

      <ApprovalDialog
        isOpen={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        onApprove={(wrongAnswers) => handleApproval(true, wrongAnswers)}
        onReject={() => handleApproval(false)}
        item={approvalItem}
        type={approvalType}
        showWrongAnswersHelp={true}
      />
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSubmit={handleChangePassword}
        userType="parent"
      />
      <DeadlineSettingsDialog
        isOpen={isDeadlineSettingsOpen}
        onClose={() => setIsDeadlineSettingsOpen(false)}
        onSave={handleSaveDeadlineSettings}
        currentSettings={deadlineSettings}
      />
    </div>
  );
}
