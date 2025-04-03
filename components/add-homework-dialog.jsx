"use client";

import { useState, useEffect } from "react";
import { X, Clock, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function AddHomeworkDialog({
  isOpen,
  onClose,
  onAdd,
  initialData,
  subjects = [],
}) {
  const [subjectId, setSubjectId] = useState(initialData?.subject_id || "");
  const [name, setName] = useState(initialData?.name || "");
  const [duration, setDuration] = useState(
    initialData?.duration|| "30"
  );
  const [deadline, setDeadline] = useState(initialData?.deadline || "");
  const [points, setPoints] = useState(initialData?.points?.toString() || "10");
  // 不再需要childName状态，但在提交时仍需处理

  useEffect(() => {
    if (initialData) {
      // 如果initialData中的subject是科目名称而非ID，则需要查找对应的ID
      if (initialData.subject && subjects.length > 0) {
        // 查找名称匹配的科目，并设置其ID
        const matchedSubject = subjects.find(s => s.name === initialData.subject);
        if (matchedSubject) {
          setSubjectId(matchedSubject.id);
        } else {
          setSubjectId(initialData.subject_id || "");
        }
      } else {
        setSubjectId(initialData.subject_id || "");
      }
      
      setName(initialData.title || "");
      setDuration(initialData.duration || "");
      
      // 处理deadline格式
      if (initialData.deadline) {
        // 从日期时间字符串中提取时间部分 (HH:MM)
        const timeMatch = initialData.deadline.match(/\d{2}:\d{2}/);
        setDeadline(timeMatch ? timeMatch[0] : "");
      } else {
        setDeadline("");
      }
      
      setPoints(initialData.points?.toString() || "");
    }
  }, [initialData, subjects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 根据选择的subjectId找到对应的科目名称
    const selectedSubject = subjects.find(s => s.id === subjectId);
    const subjectName = selectedSubject ? selectedSubject.name : "";
    
    onAdd({
      subject: subjectName,
      subject_id: subjectId,
      name,
      title: name,
      duration,
      deadline,
      points: Number.parseInt(points),
      completed: false,
    });

    // Reset form
    setSubjectId("");
    setName("");
    setDuration("20");
    setDeadline("");
    setPoints("10");
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
                    variant={subjectId === s.id ? "default" : "outline"}
                    className="h-10 text-sm sm:h-12 sm:text-base"
                    onClick={() => setSubjectId(s.id)}
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
