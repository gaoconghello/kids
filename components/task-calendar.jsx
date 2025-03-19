"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function TaskCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  // 生成日历数据
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // 获取当月第一天
    const firstDayOfMonth = new Date(year, month, 1)
    // 获取当月最后一天
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // 获取当月第一天是星期几（0-6，0表示星期日）
    const firstDayOfWeek = firstDayOfMonth.getDay()

    // 计算日历需要显示的天数（包括上个月和下个月的部分日期）
    const daysInCalendar = []

    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const date = new Date(year, month - 1, day)
      daysInCalendar.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      })
    }

    // 添加当月的日期
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day)
      daysInCalendar.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      })
    }

    // 添加下个月的日期，使日历填满6行
    const remainingDays = 42 - daysInCalendar.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      daysInCalendar.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      })
    }

    setCalendarDays(daysInCalendar)
  }, [currentMonth, selectedDate])

  // 检查两个日期是否是同一天
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // 处理日期选择
  const handleDateSelect = (date) => {
    // 简单地将选择的日期传递给父组件
    onDateSelect(date)
  }

  // 上个月
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // 下个月
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // 返回今天
  const goToToday = () => {
    setCurrentMonth(new Date())
    handleDateSelect(new Date())
  }

  // 月份名称
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ]

  // 星期名称
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"]

  return (
    <Card className="p-4 bg-white border-2 rounded-xl border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center text-lg font-semibold">
          <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
          任务日历
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">上个月</span>
          </Button>
          <div className="text-sm font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">下个月</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-xs font-medium text-center text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-full p-0 text-xs rounded-md",
              !day.isCurrentMonth && "text-muted-foreground opacity-50",
              day.isToday && "bg-primary/10 text-primary font-bold",
              day.isSelected && "bg-primary text-primary-foreground font-bold",
              !day.isSelected && "hover:bg-primary/10",
            )}
            onClick={() => handleDateSelect(day.date)}
          >
            {day.day}
          </Button>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="outline" size="sm" className="text-xs" onClick={goToToday}>
          返回今天
        </Button>
      </div>
    </Card>
  )
}

