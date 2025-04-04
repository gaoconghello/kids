"use client";

import { useState, useEffect } from "react";
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
          (task.completed ? task.wrongAnswers || 0 : 0),
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

  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 1,
      childName: "小明",
      title: "整理玩具",
      points: 10,
      status: "pending",
      createdAt: "2025-03-01 10:15",
    },
    {
      id: 2,
      childName: "小明",
      title: "帮妈妈洗碗",
      points: 25,
      status: "pending",
      createdAt: "2025-03-01 11:30",
    },
  ]);
  const [completedTasks, setCompletedTasks] = useState([
    {
      id: 3,
      childName: "小明",
      title: "阅读30分钟",
      points: 15,
      status: "completed",
      completedAt: "2025-03-01 09:45",
    },
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
  ]);
  const [pendingRewards, setPendingRewards] = useState([
    {
      id: 1,
      childName: "小明",
      rewardTitle: "看30分钟动画片",
      points: 50,
      status: "pending",
      requestedAt: "2025-03-01 17:15",
    },
  ]);
  const [history, setHistory] = useState([
    {
      id: 1,
      childName: "小明",
      title: "完成语文作业",
      points: 20,
      type: "earn",
      date: "2025-02-28",
    },
    {
      id: 2,
      childName: "小明",
      title: "兑换冰淇淋",
      points: 100,
      type: "spend",
      date: "2025-02-27",
    },
    {
      id: 3,
      childName: "小明",
      title: "帮爸爸整理书架",
      points: 30,
      type: "earn",
      date: "2025-02-26",
    },
    {
      id: 4,
      childName: "小明",
      title: "完成英语作业",
      points: 20,
      type: "earn",
      date: "2025-02-25",
    },
    {
      id: 5,
      childName: "小明",
      title: "完成数学练习",
      points: 25,
      type: "earn",
      date: "2025-02-24",
    },
    {
      id: 6,
      childName: "小明",
      title: "兑换画画套装",
      points: 300,
      type: "spend",
      date: "2025-02-23",
    },
    {
      id: 7,
      childName: "小明",
      title: "完成科学实验",
      points: 35,
      type: "earn",
      date: "2025-02-22",
    },
    {
      id: 8,
      childName: "小明",
      title: "整理房间",
      points: 15,
      type: "earn",
      date: "2025-02-21",
    },
    {
      id: 9,
      childName: "小明",
      title: "背诵古诗",
      points: 20,
      type: "earn",
      date: "2025-02-20",
    },
    {
      id: 10,
      childName: "小明",
      title: "兑换故事书",
      points: 150,
      type: "spend",
      date: "2025-02-19",
    },
  ]);

  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [childTasks, setChildTasks] = useState([
    {
      id: 1,
      title: "完成数学作业",
      points: 20,
      completed: false,
      time: "今天",
    },
    { id: 2, title: "阅读30分钟", points: 15, completed: true, time: "今天" },
    { id: 3, title: "整理玩具", points: 10, completed: false, time: "今天" },
    { id: 4, title: "帮妈妈洗碗", points: 25, completed: true, time: "今天" },
  ]);
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
  const [deadlineSettings, setDeadlineSettings] = useState({
    enabled: true,
    time: "20:00",
    bonusPoints: 50,
  });
  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedHomeworkDate, setSelectedHomeworkDate] = useState(new Date());
  const [showHomeworkCalendar, setShowHomeworkCalendar] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await get(`/api/homework/parent?childId=${selectedChild.id}`);
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

  // 页面加载时获取数据
  useEffect(() => {
    // 首先获取孩子列表
    fetchChildrenList();
    // 获取科目列表
    fetchSubjects();
  }, []);

  // 当选择的孩子ID变化时，重新获取相关数据
  useEffect(() => {
    if (selectedChild) {
      // 添加selectedChild检查
      // 获取待处理任务
      fetchPendingHomeworks();
      // 获取已完成作业
      fetchCompletedHomeworks();
      // 获取作业数据
      fetchChildHomeworks();
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
            const response = await post("/api/homework/pending", homeworkData);
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
    console.log("修改作业:", item);
    setEditingHomework(item);
    setIsAddHomeworkOpen(true);
  };

  const handleEditTask = (item) => {
    setEditingTask(item);
    setIsAddTaskOpen(true);
  };

  const handleAddTask = (newTask) => {
    try {
      if (editingTask) {
        console.log("修改任务:", newTask);
        setPendingTasks(
          pendingTasks.map((item) =>
            item.id === editingTask.id ? { ...item, ...newTask } : item
          )
        );
        setEditingTask(null);

        // 这里应该调用API更新数据
        // 之后刷新数据
        setTimeout(() => {
          fetchPendingHomeworks();
        }, 500);
      } else {
        console.log("添加新任务:", newTask);
        // 如果是数组（多个小朋友的任务），则添加多个
        if (Array.isArray(newTask)) {
          const nextId =
            pendingTasks.length > 0
              ? Math.max(...pendingTasks.map((task) => task.id)) + 1
              : 1;
          const newTasks = newTask.map((task, index) => ({
            ...task,
            id: nextId + index,
            status: "pending",
            createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          }));
          setPendingTasks([...pendingTasks, ...newTasks]);
        } else {
          // 单个任务的情况
          const nextId =
            pendingTasks.length > 0
              ? Math.max(...pendingTasks.map((task) => task.id)) + 1
              : 1;
          setPendingTasks([
            ...pendingTasks,
            {
              ...newTask,
              id: nextId,
              status: "pending",
              createdAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            },
          ]);
        }

        // 这里应该调用API添加数据
        // 之后刷新数据
        setTimeout(() => {
          fetchPendingHomeworks();
        }, 500);
      }
    } catch (error) {
      alert("操作失败：" + error.message);
    }
  };

  const handleAddReward = (newReward) => {
    console.log("添加新奖励:", newReward);
    const nextId =
      rewards.length > 0 ? Math.max(...rewards.map((r) => r.id)) + 1 : 1;
    setRewards([...rewards, { ...newReward, id: nextId }]);
    alert("奖励添加成功！");
  };

  const openApprovalDialog = (item, type) => {
    setApprovalItem(item);
    setApprovalType(type);
    setApprovalDialogOpen(true);
  };

  const handleApproval = async (approved, wrongAnswers = 0) => {
    if (approvalType === "homework-add") {
      if (approved) {
        try {
          // 调用API批准作业
          setIsLoading(true);

          const response = await put(`/api/homework/pending`, {
            id: approvalItem.id,
          });

          const result = await response.json();

          if (result.code === 200) {
            // 批准成功，从待处理列表中移除该作业
            setPendingHomework(
              pendingHomework.filter((item) => item.id !== approvalItem.id)
            );
            console.log("作业审批成功:", approvalItem.title);
            // 刷新数据
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
        // 作业被拒绝，暂时仅在前端处理
        console.log("作业被拒绝:", approvalItem.title);
        // 从待处理列表中移除
        setPendingHomework(
          pendingHomework.filter((item) => item.id !== approvalItem.id)
        );
      }
    } else if (approvalType === "homework-complete") {
      try {
        // 调用API批准作业完成（无论是批准还是拒绝）
        setIsLoading(true);

        const response = await put(`/api/homework/complete`, {
          id: approvalItem.id,
          incorrect: wrongAnswers || 0,
          approved: approved,
        });

        const result = await response.json();

        if (result.code === 200) {
          // 批准成功，从待完成列表中移除该作业
          const updatedCompletedHomework = completedHomework.filter(
            (item) => item.id !== approvalItem.id
          );
          setCompletedHomework(updatedCompletedHomework);

          if (approved) {
            // 更新作业列表中对应作业的状态
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

            // 添加到历史记录
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

            // 更新积分
            setChildPoints({
              ...childPoints,
              total: childPoints.total + approvalItem.points,
              thisWeek: childPoints.thisWeek + approvalItem.points,
            });
          } else {
            console.log(`作业 ${approvalItem.title} 被拒绝`);
          }
          
          // 刷新数据
          fetchCompletedHomeworks();
        } else {
          console.error("作业完成审批失败:", result.message);
          alert(`审批失败: ${result.message || "未知错误"}`);
        }
      } catch (error) {
        console.error("作业完成审批请求出错:", error);
        alert(`审批请求出错: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else if (approvalType === "task-add") {
      if (approved) {
        setPendingTasks(
          pendingTasks.filter((item) => item.id !== approvalItem.id)
        );

        // 这里应该调用API更新数据
        // 之后刷新数据
        setTimeout(() => {
          fetchPendingHomeworks();
        }, 500);
      }
    } else if (approvalType === "task-complete") {
      if (approved) {
        setCompletedTasks(
          completedTasks.filter((item) => item.id !== approvalItem.id)
        );
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
        setChildPoints({
          ...childPoints,
          total: childPoints.total + approvalItem.points,
          thisWeek: childPoints.thisWeek + approvalItem.points,
          thisMonth: childPoints.thisMonth + approvalItem.points,
        });

        // 刷新数据
        fetchPendingHomeworks();
      }
    } else if (approvalType === "reward-redeem") {
      if (approved) {
        setPendingRewards(
          pendingRewards.filter((item) => item.id !== approvalItem.id)
        );
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
        setChildPoints({
          ...childPoints,
          total: childPoints.total - approvalItem.points,
          thisWeekSpent: childPoints.thisWeekSpent + approvalItem.points,
        });
      }
    }

    setApprovalDialogOpen(false);
    setApprovalItem(null);
  };

  const handleChangePassword = (passwordData) => {
    console.log("修改密码:", passwordData);
    alert("密码修改成功！");
  };

  const handleSaveDeadlineSettings = (settings) => {
    console.log("保存截止时间设置:", settings);
    setDeadlineSettings(settings);
    alert("设置保存成功！");
  };

  const handleHomeworkDateSelect = async (date) => {
    setSelectedHomeworkDate(date);
    
    // 使用本地日期格式，避免时区问题
    // 创建一个新的日期对象避免修改原始对象
    const localDate = new Date(date);
    
    // 格式化为YYYY-MM-DD格式
    const formattedDate = localDate.getFullYear() + '-' + 
                          String(localDate.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(localDate.getDate()).padStart(2, '0');
    
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
        console.log(`已获取${formattedDate}的作业数据，共${result.data.length}条记录`);
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

  const handleTaskDateSelect = (date) => {
    setSelectedTaskDate(date);
    console.log("选择的任务日期:", date.toISOString().split("T")[0]);

    const formattedDate = date.toISOString().split("T")[0];

    if (formattedDate === new Date().toISOString().split("T")[0]) {
      setChildTasks([
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
          completed: true,
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
          completed: true,
          time: "今天",
        },
      ]);
    } else {
      setChildTasks([
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
          completed: true,
          time: `${date.getMonth() + 1}月${date.getDate()}日`,
        },
      ]);
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
                                      <PenLine className="w-5 h-5 text-primary" />
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
                                  const totalWrongAnswers = subject.tasks.reduce(
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
                                  const totalWrongAnswers = subject.tasks.reduce(
                                    (sum, t) => sum + (t.wrongAnswers || 0),
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
                            {calculateWrongAnswersStats(childHomework).totalWrongAnswers}
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
                            {calculateWrongAnswersStats(childHomework).avgWrongAnswers}
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
