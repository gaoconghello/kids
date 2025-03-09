"use client";

import { useState, useEffect } from "react";
import { X, Clock, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// 修改 AddHomeworkDialog 组件，添加 childrenList 参数
export function AddHomeworkDialog({
  isOpen,
  onClose,
  onAdd,
  initialData,
  childId = "",
  subjects = [],
}) {
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [name, setName] = useState(initialData?.name || "");
  const [duration, setDuration] = useState(
    initialData?.duration?.replace("分钟", "") || "30"
  );
  const [deadline, setDeadline] = useState(initialData?.deadline || "");
  const [points, setPoints] = useState(initialData?.points?.toString() || "10");
  // 不再需要childName状态，但在提交时仍需处理

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject || "");
      setName(initialData.name || "");
      setDuration(initialData.duration?.replace("分钟", "") || "");
      setDeadline(initialData.deadline || "");
      setPoints(initialData.points?.toString() || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      subject,
      name,
      duration: `${duration}分钟`,
      deadline,
      points: Number.parseInt(points),
      completed: false,
    });

    // Reset form
    setSubject("");
    setName("");
    setDuration("");
    setDeadline("");
    setPoints("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="relative w-full max-w-lg overflow-hidden rounded-2xl">
        <div className="absolute right-2 top-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {initialData ? "修改作业" : "添加新作业"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {initialData ? "修改作业内容" : "记录今天要完成的作业吧！"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">科目</Label>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {subjects.map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    variant={subject === s.id ? "default" : "outline"}
                    className="h-10 text-sm sm:h-12 sm:text-base"
                    onClick={() => setSubject(s.id)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">作业内容</Label>
              <div className="relative">
                <BookOpen className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 pl-10 text-sm sm:h-12 sm:text-base"
                  placeholder="例如：完成练习册第12页"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">预计用时（分钟）</Label>
                <div className="relative">
                  <Clock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-10 pl-10 text-sm sm:h-12 sm:text-base"
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">截止时间</Label>
                <Input
                  id="deadline"
                  type="time"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-10 text-sm sm:h-12 sm:text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">完成可获得积分</Label>
              <div className="relative">
                <Award className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="h-10 pl-10 text-sm sm:h-12 sm:text-base"
                  placeholder="15"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              {initialData ? "保存修改" : "添加作业"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
