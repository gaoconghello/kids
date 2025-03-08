"use client";

import { useState, useEffect } from "react";
import { X, User, AlertTriangle, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditChildDialog({ isOpen, onClose, onEdit, child }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [points, setPoints] = useState("0");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当child属性变化时更新表单
  useEffect(() => {
    if (child) {
      console.log("编辑孩子数据:", child); // 添加日志，查看传入的数据
      setUsername(child.username || "");
      setName(child.name || "");
      setGender(child.gender || "m");
      setAge(child.age ? child.age.toString() : "");
      setGrade(child.grade || "");
      setPoints(child.points ? child.points.toString() : "0");
    }
  }, [child]);

  
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) newErrors.username = "请输入用户名";
    if (!name.trim()) newErrors.name = "请输入姓名";
    if (!age.trim()) newErrors.age = "请输入年龄";
    if (isNaN(Number(age)) || Number(age) <= 0)
      newErrors.age = "请输入有效的年龄";
    if (!grade) newErrors.grade = "请选择年级";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const updatedChild = {
      id: child.id,
      username,
      name,
      gender,
      age: Number(age),
      grade,
      points: Number(points),
      avatar: child.avatar || "/placeholder.svg?height=40&width=40",
      familyId: child.familyId,
    };

    const result = await onEdit(updatedChild);

    setIsSubmitting(false);

    // 处理用户名重复错误
    if (result && result.error === "username") {
      setErrors({
        ...errors,
        username: result.message,
      });
      return;
    }

    // 如果没有错误，关闭对话框
    if (!result) {
      onClose();
    }
  };

  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50">
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
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
            <h2 className="text-2xl font-bold text-primary">编辑孩子信息</h2>
            <p className="text-sm text-muted-foreground">修改孩子的基本信息</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${
                    errors.username ? "border-red-500" : ""
                  }`}
                  placeholder="请输入用户名"
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  placeholder="请输入姓名"
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>性别</Label>
              <RadioGroup
                value={gender}
                onValueChange={setGender}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="m" id="edit-male" />
                  <Label htmlFor="edit-male" className="cursor-pointer">
                    男
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="f" id="edit-female" />
                  <Label htmlFor="edit-female" className="cursor-pointer">
                    女
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <div className="relative">
                  <Calendar className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${
                      errors.age ? "border-red-500" : ""
                    }`}
                    placeholder="请输入年龄"
                  />
                </div>
                {errors.age && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{errors.age}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">年级</Label>
                <div className="relative">
                  <GraduationCap className="absolute z-10 w-5 h-5 text-gray-400 left-3 top-3" />
                  <Select value={grade}>
                    <SelectTrigger
                      className={`h-10 sm:h-12 pl-10 text-sm sm:text-base ${
                        errors.grade ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">幼儿园</SelectItem>
                      <SelectItem value="1">一年级</SelectItem>
                      <SelectItem value="2">二年级</SelectItem>
                      <SelectItem value="3">三年级</SelectItem>
                      <SelectItem value="4">四年级</SelectItem>
                      <SelectItem value="5">五年级</SelectItem>
                      <SelectItem value="6">六年级</SelectItem>
                      <SelectItem value="7">初一</SelectItem>
                      <SelectItem value="8">初二</SelectItem>
                      <SelectItem value="9">初三</SelectItem>
                      <SelectItem value="10">高一</SelectItem>
                      <SelectItem value="11">高二</SelectItem>
                      <SelectItem value="12">高三</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.grade && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{errors.grade}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">积分</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="h-10 text-sm sm:h-12 sm:text-base"
                placeholder="积分"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-purple-600"
              disabled={isSubmitting}
            >
              保存修改
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
