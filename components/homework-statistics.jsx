"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  BarChart3,
  User,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { get } from "@/lib/http"

// 将数字转换为时间格式 (18 -> "18:00")
const formatTimePoint = (hour, minute = 0) => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
}

// 自定义Y轴刻度
const timeTickFormatter = (value) => {
  if (value >= 24) {
    // 次日时间
    const hour = Math.floor(value - 24)
    return `次日${hour}:00`
  } else {
    // 当日时间
    return `${value}:00`
  }
}

export function HomeworkStatistics({ selectedChild }) {
  const [displayMode, setDisplayMode] = useState("both") // "count", "time", "wrong", "both"
  const [timeRange, setTimeRange] = useState("7")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false)

  // 从API获取的作业数据
  const [childHomework, setChildHomework] = useState([])
  
  // 从API获取数据
  useEffect(() => {
    const fetchHomeworkData = async () => {
      // 确保selectedChild有效且有ID
      console.log("selectedChild", selectedChild);
      const childId = selectedChild?.id
        
      if (!childId) {
        // 如果没有childId，清空数据但不显示错误
        console.log("没有childId");
        setChildHomework([])
        setData([])
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await get(`/api/homework/statistics?childId=${childId}&lastDays=${timeRange}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '获取作业统计数据失败')
        }
        
        const result = await response.json()
        
        if (result.code === 200 && result.data) {
          setChildHomework(result.data)
          processHomeworkData(result.data)
        } else {
          throw new Error(result.message || '获取作业统计数据失败')
        }
      } catch (err) {
        console.error('获取作业统计数据错误:', err)
        setError(err.message)
        setData([])
        setChildHomework([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchHomeworkData()
  }, [selectedChild, timeRange])
  
  // 处理API返回的数据，生成图表所需数据结构
  const processHomeworkData = (homeworkData) => {
    if (!homeworkData || !homeworkData.length) {
      setData([])
      return
    }
    
    // 按日期分组并处理数据
    const processedData = []
    const today = new Date()
    const dataMap = new Map()
    
    // 初始化日期映射
    for (let i = Number(timeRange) - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      dataMap.set(dateString, {
        date: date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
        homeworkCount: 0,
        wrongAnswersCount: 0,
        completionTime: "无数据",
        timeValue: 0,
        fullDate: dateString,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dayOfWeek: date.getDay(),
        hasData: false
      })
    }
    
    // 处理每条作业记录
    homeworkData.forEach(homework => {
      const dateKey = new Date(homework.completionDate || homework.homeworkDate).toISOString().split('T')[0]
      
      if (dataMap.has(dateKey)) {
        const entry = dataMap.get(dateKey)
        entry.hasData = true
        entry.homeworkCount++
        
        // 处理错题数量
        if (homework.wrongAnswers) {
          entry.wrongAnswersCount += homework.wrongAnswers
        }
        
        // 处理完成时间
        if (homework.completionTime) {
          const [hours, minutes] = homework.completionTime.split(':').map(Number)
          let timeValue = hours + minutes / 60
          
          // 处理次日凌晨时间
          if (hours < 12) {
            timeValue += 24
          }
          
          // 如果是第一条数据或时间比现有值晚，则更新
          if (!entry.timeValue || timeValue > entry.timeValue) {
            entry.timeValue = timeValue
            entry.completionTime = formatTimePoint(hours, minutes)
          }
        }
        
        dataMap.set(dateKey, entry)
      }
    })
    
    // 将Map转换为数组
    dataMap.forEach(value => {
      processedData.push(value)
    })
    
    setData(processedData.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)))
  }

  // 计算平均值
  const avgHomeworkCount =
    data.length > 0 && data.some(item => item.hasData)
      ? (data.reduce((sum, item) => sum + item.homeworkCount, 0) / data.filter(item => item.hasData).length).toFixed(1)
      : 0

  // 计算平均完成时间点
  const calculateAvgTimePoint = () => {
    const dataWithTime = data.filter(item => item.hasData && item.timeValue > 0)
    
    if (dataWithTime.length === 0) return "无数据"

    const totalTimeValue = dataWithTime.reduce((sum, item) => sum + item.timeValue, 0)
    const avgTimeValue = totalTimeValue / dataWithTime.length

    // 将平均值转回时间格式
    let hour = Math.floor(avgTimeValue)
    const minute = Math.round((avgTimeValue - hour) * 60)

    // 处理次日时间
    if (hour >= 24) {
      hour -= 24
      return `次日${formatTimePoint(hour, minute)}`
    }

    return formatTimePoint(hour, minute)
  }

  const avgTimePoint = calculateAvgTimePoint()

  // 深度分析函数
  const performDeepAnalysis = () => {
    const dataWithStats = data.filter(item => item.hasData)
    if (dataWithStats.length === 0) return null

    // 1. 趋势分析
    // 将数据分为前半部分和后半部分，比较平均值变化
    const halfIndex = Math.floor(dataWithStats.length / 2)
    const firstHalf = dataWithStats.slice(0, halfIndex)
    const secondHalf = dataWithStats.slice(halfIndex)

    const firstHalfAvgCount = firstHalf.reduce((sum, item) => sum + item.homeworkCount, 0) / firstHalf.length
    const secondHalfAvgCount = secondHalf.reduce((sum, item) => sum + item.homeworkCount, 0) / secondHalf.length
    const countTrend = secondHalfAvgCount - firstHalfAvgCount

    const firstHalfTimeData = firstHalf.filter(item => item.timeValue > 0)
    const secondHalfTimeData = secondHalf.filter(item => item.timeValue > 0)
    
    const firstHalfAvgTime = firstHalfTimeData.length > 0
      ? firstHalfTimeData.reduce((sum, item) => sum + item.timeValue, 0) / firstHalfTimeData.length
      : 0
    const secondHalfAvgTime = secondHalfTimeData.length > 0
      ? secondHalfTimeData.reduce((sum, item) => sum + item.timeValue, 0) / secondHalfTimeData.length
      : 0
    const timeTrend = secondHalfAvgTime - firstHalfAvgTime

    const firstHalfAvgWrong = firstHalf.reduce((sum, item) => sum + item.wrongAnswersCount, 0) / firstHalf.length
    const secondHalfAvgWrong = secondHalf.reduce((sum, item) => sum + item.wrongAnswersCount, 0) / secondHalf.length
    const wrongTrend = secondHalfAvgWrong - firstHalfAvgWrong

    // 2. 周期性分析
    const weekdayData = dataWithStats.filter((item) => !item.isWeekend)
    const weekendData = dataWithStats.filter((item) => item.isWeekend)

    const weekdayAvgCount =
      weekdayData.length > 0 ? weekdayData.reduce((sum, item) => sum + item.homeworkCount, 0) / weekdayData.length : 0
    const weekendAvgCount =
      weekendData.length > 0 ? weekendData.reduce((sum, item) => sum + item.homeworkCount, 0) / weekendData.length : 0

    const weekdayTimeData = weekdayData.filter(item => item.timeValue > 0)
    const weekendTimeData = weekendData.filter(item => item.timeValue > 0)
    
    const weekdayAvgTime =
      weekdayTimeData.length > 0 ? weekdayTimeData.reduce((sum, item) => sum + item.timeValue, 0) / weekdayTimeData.length : 0
    const weekendAvgTime =
      weekendTimeData.length > 0 ? weekendTimeData.reduce((sum, item) => sum + item.timeValue, 0) / weekendTimeData.length : 0

    const weekdayAvgWrong =
      weekdayData.length > 0
        ? weekdayData.reduce((sum, item) => sum + item.wrongAnswersCount, 0) / weekdayData.length
        : 0
    const weekendAvgWrong =
      weekendData.length > 0
        ? weekendData.reduce((sum, item) => sum + item.wrongAnswersCount, 0) / weekendData.length
        : 0

    // 3. 相关性分析
    // 计算作业数量和完成时间的相关性
    const timeCorrelationData = dataWithStats.filter(item => item.timeValue > 0)
    const correlation = calculateCorrelation(
      timeCorrelationData.map((item) => item.homeworkCount),
      timeCorrelationData.map((item) => item.timeValue),
    )

    const wrongCorrelation = calculateCorrelation(
      dataWithStats.map((item) => item.homeworkCount),
      dataWithStats.map((item) => item.wrongAnswersCount),
    )

    // 4. 异常值检测
    // 找出完成时间特别晚的日期（超过平均值+1.5小时）
    const timeData = dataWithStats.filter(item => item.timeValue > 0)
    const avgTimeValue = timeData.length > 0 
      ? timeData.reduce((sum, item) => sum + item.timeValue, 0) / timeData.length
      : 0
    const lateNights = timeData
      .filter((item) => item.timeValue > avgTimeValue + 1.5)
      .map((item) => item.date)
      .slice(0, 3) // 最多显示3个

    // 5. 按星期分析
    const dayOfWeekData = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const dayData = dataWithStats.filter((item) => item.dayOfWeek === day)
      const dayTimeData = dayData.filter(item => item.timeValue > 0)
      
      return {
        day: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][day],
        avgCount:
          dayData.length > 0
            ? (dayData.reduce((sum, item) => sum + item.homeworkCount, 0) / dayData.length).toFixed(1)
            : "0",
        avgTime:
          dayTimeData.length > 0
            ? formatTimeValueToString(dayTimeData.reduce((sum, item) => sum + item.timeValue, 0) / dayTimeData.length)
            : "无数据",
      }
    })

    return {
      countTrend,
      timeTrend,
      wrongTrend,
      weekdayAvgCount,
      weekendAvgCount,
      weekdayAvgTime,
      weekendAvgTime,
      weekdayAvgWrong,
      weekendAvgWrong,
      correlation,
      wrongCorrelation,
      lateNights,
      dayOfWeekData,
    }
  }

  // 辅助函数：计算相关系数
  const calculateCorrelation = (array1, array2) => {
    if (array1.length !== array2.length) return 0
    if (array1.length === 0) return 0

    const n = array1.length
    const mean1 = array1.reduce((sum, val) => sum + val, 0) / n
    const mean2 = array2.reduce((sum, val) => sum + val, 0) / n

    let numerator = 0
    let denom1 = 0
    let denom2 = 0

    for (let i = 0; i < n; i++) {
      const diff1 = array1[i] - mean1
      const diff2 = array2[i] - mean2
      numerator += diff1 * diff2
      denom1 += diff1 * diff1
      denom2 += diff2 * diff2
    }

    if (denom1 === 0 || denom2 === 0) return 0
    return numerator / Math.sqrt(denom1 * denom2)
  }

  // 辅助函数：将时间值转换为字符串
  const formatTimeValueToString = (timeValue) => {
    let hour = Math.floor(timeValue)
    const minute = Math.round((timeValue - hour) * 60)

    if (hour >= 24) {
      hour -= 24
      return `次日${formatTimePoint(hour, minute)}`
    }

    return formatTimePoint(hour, minute)
  }

  // 获取深度分析结果
  const deepAnalysis = showDeepAnalysis ? performDeepAnalysis() : null

  return (
    <Card className="overflow-hidden bg-white border-2 rounded-2xl border-primary/20">
      <CardHeader className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
          <CardTitle className="flex items-center text-2xl">
            <BarChart3 className="w-6 h-6 mr-2 text-primary" />
            作业统计
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="选择时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">最近7天</SelectItem>
                  <SelectItem value="30">最近30天</SelectItem>
                  <SelectItem value="60">最近60天</SelectItem>
                  <SelectItem value="90">最近90天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <CardDescription>查看{typeof selectedChild === 'object' ? (selectedChild?.name || selectedChild?.label || '孩子') : '孩子'}的作业完成情况统计</CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {/* 如果没有选择孩子，显示提示 */}
        {!selectedChild?.id && (
          <div className="flex flex-col items-center justify-center h-40">
            <User className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-gray-500">请选择一个孩子查看作业统计</p>
          </div>
        )}

        {/* 加载状态 */}
        {selectedChild?.id && loading && (
          <div className="flex items-center justify-center h-20 mb-6">
            <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
            <span className="ml-3 font-medium text-primary">加载中...</span>
          </div>
        )}

        {/* 错误提示 */}
        {selectedChild?.id && error && (
          <div className="p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>获取数据失败: {error}</span>
            </div>
          </div>
        )}

        {/* 数据展示 */}
        {selectedChild?.id && !loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">平均每日作业数量</p>
                      <h3 className="text-2xl font-bold text-blue-700">{avgHomeworkCount}</h3>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">平均完成时间</p>
                      <h3 className="text-2xl font-bold text-purple-700">{avgTimePoint}</h3>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">总作业数量</p>
                      <h3 className="text-2xl font-bold text-green-700">
                        {data.reduce((sum, item) => sum + item.homeworkCount, 0)}
                      </h3>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">总错题数量</p>
                      <h3 className="text-2xl font-bold text-amber-700">
                        {data.reduce((sum, item) => sum + item.wrongAnswersCount, 0)}
                      </h3>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 显示模式选择 */}
            <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Label className="font-medium text-gray-700">显示数据：</Label>
                  <RadioGroup value={displayMode} onValueChange={setDisplayMode} className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="count" id="count" />
                      <Label htmlFor="count" className="text-blue-600 cursor-pointer">
                        仅作业数量
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="time" id="time" />
                      <Label htmlFor="time" className="text-green-600 cursor-pointer">
                        仅完成时间
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wrong" id="wrong" />
                      <Label htmlFor="wrong" className="cursor-pointer text-rose-600">
                        仅错题数量
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="text-purple-600 cursor-pointer">
                        同时显示全部
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button
                  onClick={() => setShowDeepAnalysis(!showDeepAnalysis)}
                  className="text-white bg-gradient-to-r from-indigo-500 to-purple-600"
                  disabled={data.filter(item => item.hasData).length === 0}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {showDeepAnalysis ? "隐藏深度分析" : "深度分析"}
                </Button>
              </div>
            </div>

            {/* 图表部分 */}
            <div className="h-[400px]">
              {data.length > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 50,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />

                      {/* 只有在显示作业数量、错题数量或同时显示全部时才显示左侧Y轴 */}
                      {(displayMode === "count" || displayMode === "wrong" || displayMode === "both") && (
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      )}

                      {/* 只有在显示完成时间或同时显示两者时才显示右侧Y轴 */}
                      {(displayMode === "time" || displayMode === "both") && (
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#82ca9d"
                          domain={[18, 27]} // 从18:00到次日3:00
                          ticks={[18, 19, 20, 21, 22, 23, 24, 25, 26, 27]} // 固定刻度
                          tickFormatter={timeTickFormatter}
                        />
                      )}

                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === "timeValue") {
                            const item = data.find((d) => d.timeValue === value)
                            return [item ? item.completionTime : value, "完成时间"]
                          }
                          return [
                            value,
                            name === "homeworkCount" ? "作业数量" : name === "wrongAnswersCount" ? "错题数量" : name,
                          ]
                        }}
                        labelFormatter={(label) => `日期: ${label}`}
                      />
                      <Legend />

                      {/* 只有在显示作业数量或同时显示两者时才显示作业数量线 */}
                      {(displayMode === "count" || displayMode === "both") && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="homeworkCount"
                          name="作业数量"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}

                      {/* 添加错题数量线 */}
                      {(displayMode === "wrong" || displayMode === "both") && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="wrongAnswersCount"
                          name="错题数量"
                          stroke="#ff6b6b"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                      )}

                      {/* 只有在显示完成时间或同时显示两者时才显示完成时间线 */}
                      {(displayMode === "time" || displayMode === "both") && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="timeValue"
                          name="完成时间"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500">暂无数据</p>
                </div>
              )}
            </div>

            <div className="p-4 mt-6 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-700">统计分析</h4>
              </div>
              {data.filter(item => item.hasData).length > 0 ? (
                <p className="text-sm text-blue-600">
                  在过去的{timeRange}天里，
                  {typeof selectedChild === 'object' 
                    ? (selectedChild?.name || selectedChild?.label || '孩子') 
                    : '孩子'}
                  平均每天完成{avgHomeworkCount}个作业，平均错题数量为
                  {(data.reduce((sum, item) => sum + item.wrongAnswersCount, 0) / Math.max(1, data.filter(item => item.hasData).length)).toFixed(1)}个， 平均完成时间为
                  {avgTimePoint}。最近7天共完成
                  {data.slice(Math.max(0, data.length - 7), data.length).reduce((sum, item) => sum + item.homeworkCount, 0)}个作业，
                  出现错题{data.slice(Math.max(0, data.length - 7), data.length).reduce((sum, item) => sum + item.wrongAnswersCount, 0)}个。
                  {Number(avgHomeworkCount) > 3 ? "作业量较大，请注意合理安排时间。" : "作业量适中，继续保持。"}
                  {avgTimePoint.includes("次日") ? "完成作业时间较晚，建议提前开始作业。" : "作业完成时间合理，很好！"}
                </p>
              ) : (
                <p className="text-sm text-blue-600">暂无足够数据进行分析，请继续收集数据。</p>
              )}
            </div>
          </>
        )}

        {/* 深度分析部分 - 仅在有数据且不在加载状态时显示 */}
        {!loading && !error && showDeepAnalysis && deepAnalysis && (
          <div className="p-4 mt-6 border border-indigo-100 rounded-lg bg-indigo-50">
            <h4 className="flex items-center mb-4 text-lg font-semibold text-indigo-700">
              <TrendingUp className="w-5 h-5 mr-2" />
              深度分析结果
            </h4>

            {/* 趋势分析 */}
            <div className="mb-6">
              <h5 className="mb-2 font-medium text-indigo-600">趋势分析</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">作业数量趋势：</span>
                    <div className="flex items-center">
                      {deepAnalysis.countTrend > 0.2 ? (
                        <Badge className="flex items-center text-red-700 bg-red-100">
                          <ChevronUp className="w-3 h-3 mr-1" />
                          增加 {deepAnalysis.countTrend.toFixed(1)}
                        </Badge>
                      ) : deepAnalysis.countTrend < -0.2 ? (
                        <Badge className="flex items-center text-green-700 bg-green-100">
                          <ChevronDown className="w-3 h-3 mr-1" />
                          减少 {Math.abs(deepAnalysis.countTrend).toFixed(1)}
                        </Badge>
                      ) : (
                        <Badge className="text-gray-700 bg-gray-100">保持稳定</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">完成时间趋势：</span>
                    <div className="flex items-center">
                      {deepAnalysis.timeTrend > 0.5 ? (
                        <Badge className="flex items-center text-red-700 bg-red-100">
                          <ChevronUp className="w-3 h-3 mr-1" />
                          变晚 {(deepAnalysis.timeTrend * 60).toFixed(0)}分钟
                        </Badge>
                      ) : deepAnalysis.timeTrend < -0.5 ? (
                        <Badge className="flex items-center text-green-700 bg-green-100">
                          <ChevronDown className="w-3 h-3 mr-1" />
                          变早 {Math.abs(deepAnalysis.timeTrend * 60).toFixed(0)}分钟
                        </Badge>
                      ) : (
                        <Badge className="text-gray-700 bg-gray-100">保持稳定</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">错题数量趋势：</span>
                    <div className="flex items-center">
                      {deepAnalysis.wrongTrend > 0.2 ? (
                        <Badge className="flex items-center text-red-700 bg-red-100">
                          <ChevronUp className="w-3 h-3 mr-1" />
                          增加 {deepAnalysis.wrongTrend.toFixed(1)}
                        </Badge>
                      ) : deepAnalysis.wrongTrend < -0.2 ? (
                        <Badge className="flex items-center text-green-700 bg-green-100">
                          <ChevronDown className="w-3 h-3 mr-1" />
                          减少 {Math.abs(deepAnalysis.wrongTrend).toFixed(1)}
                        </Badge>
                      ) : (
                        <Badge className="text-gray-700 bg-gray-100">保持稳定</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 周期性分析 */}
            <div className="mb-6">
              <h5 className="mb-2 font-medium text-indigo-600">工作日与周末对比</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">工作日平均作业：</span>
                    <span className="font-medium">{deepAnalysis.weekdayAvgCount.toFixed(1)}个</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">周末平均作业：</span>
                    <span className="font-medium">{deepAnalysis.weekendAvgCount.toFixed(1)}个</span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">工作日平均完成时间：</span>
                    <span className="font-medium">{formatTimeValueToString(deepAnalysis.weekdayAvgTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">周末平均完成时间：</span>
                    <span className="font-medium">{formatTimeValueToString(deepAnalysis.weekendAvgTime)}</span>
                  </div>
                </div>
                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">工作日平均错题：</span>
                    <span className="font-medium">{deepAnalysis.weekdayAvgWrong.toFixed(1)}个</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">周末平均错题：</span>
                    <span className="font-medium">{deepAnalysis.weekendAvgWrong.toFixed(1)}个</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 按星期分析 */}
            <div className="mb-6">
              <h5 className="mb-2 font-medium text-indigo-600">按星期分析</h5>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {deepAnalysis.dayOfWeekData.map((day) => (
                  <div key={day.day} className="p-3 bg-white border border-indigo-100 rounded-lg">
                    <div className="text-center">
                      <div className="mb-1 font-medium text-indigo-700">{day.day}</div>
                      <div className="text-sm text-gray-600">作业: {day.avgCount}个</div>
                      <div className="text-sm text-gray-600">时间: {day.avgTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 相关性分析 */}
            <div className="mb-6">
              <h5 className="mb-2 font-medium text-indigo-600">相关性分析</h5>
              <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">作业数量与完成时间的相关性：</span>
                  <div className="flex items-center">
                    {deepAnalysis.correlation > 0.3 ? (
                      <Badge className="bg-amber-100 text-amber-700">
                        强正相关 ({deepAnalysis.correlation.toFixed(2)})
                      </Badge>
                    ) : deepAnalysis.correlation < -0.3 ? (
                      <Badge className="text-green-700 bg-green-100">
                        强负相关 ({deepAnalysis.correlation.toFixed(2)})
                      </Badge>
                    ) : deepAnalysis.correlation > 0.1 ? (
                      <Badge className="bg-amber-50 text-amber-600">
                        弱正相关 ({deepAnalysis.correlation.toFixed(2)})
                      </Badge>
                    ) : deepAnalysis.correlation < -0.1 ? (
                      <Badge className="text-green-600 bg-green-50">
                        弱负相关 ({deepAnalysis.correlation.toFixed(2)})
                      </Badge>
                    ) : (
                      <Badge className="text-gray-700 bg-gray-100">
                        无明显相关 ({deepAnalysis.correlation.toFixed(2)})
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {deepAnalysis.correlation > 0.3
                    ? "作业数量越多，完成时间越晚，建议合理分配作业时间。"
                    : deepAnalysis.correlation < -0.3
                      ? "作业数量越多，完成时间反而越早，说明时间安排很合理。"
                      : "作业数量与完成时间没有明显关系。"}
                </p>
              </div>
              <div className="p-3 mt-2 bg-white border border-indigo-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">作业数量与错题数量的相关性：</span>
                  <div className="flex items-center">
                    {deepAnalysis.wrongCorrelation > 0.3 ? (
                      <Badge className="bg-amber-100 text-amber-700">
                        强正相关 ({deepAnalysis.wrongCorrelation.toFixed(2)})
                      </Badge>
                    ) : deepAnalysis.wrongCorrelation < -0.3 ? (
                      <Badge className="text-green-700 bg-green-100">
                        强负相关 ({deepAnalysis.wrongCorrelation.toFixed(2)})
                      </Badge>
                    ) : deepAnalysis.wrongCorrelation > 0.1 ? (
                      <Badge className="bg-amber-50 text-amber-600">
                        弱正相关 ({deepAnalysis.wrongCorrelation.toFixed(2)})
                      </Badge>
                    ) : deepAnalysis.wrongCorrelation < -0.1 ? (
                      <Badge className="text-green-600 bg-green-50">
                        弱负相关 ({deepAnalysis.wrongCorrelation.toFixed(2)})
                      </Badge>
                    ) : (
                      <Badge className="text-gray-700 bg-gray-100">
                        无明显相关 ({deepAnalysis.wrongCorrelation.toFixed(2)})
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {deepAnalysis.wrongCorrelation > 0.3
                    ? "作业数量越多，错题数量越多，可能需要更多的复习和巩固。"
                    : deepAnalysis.wrongCorrelation < -0.3
                      ? "作业数量越多，错题数量反而越少，说明学习效果很好。"
                      : "作业数量与错题数量没有明显关系。"}
                </p>
              </div>
            </div>

            {/* 异常值检测 */}
            {deepAnalysis.lateNights.length > 0 && (
              <div className="mb-6">
                <h5 className="mb-2 font-medium text-indigo-600">异常值检测</h5>
                <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="text-gray-700">发现完成时间异常晚的日期：</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deepAnalysis.lateNights.map((date, index) => (
                      <Badge key={index} className="bg-amber-100 text-amber-700">
                        {date}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-amber-600">
                    这些日期的作业完成时间明显晚于平均水平，建议关注孩子的作息情况。
                  </p>
                </div>
              </div>
            )}

            {/* 错题分析部分 */}
            <div className="mb-6">
              <h5 className="mb-2 font-medium text-indigo-600">错题分析</h5>
              <div className="space-y-4">
                {/* 科目错题分布 */}
                <div className="p-4 bg-white border border-indigo-100 rounded-lg">
                  <h4 className="mb-3 font-medium text-indigo-700">科目错题分布</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {/* 根据API数据计算各科目错题统计 */}
                    {(() => {
                      // 按科目分组数据
                      const subjectMap = new Map()
                      
                      childHomework.forEach(homework => {
                        const subject = homework.subject || { id: 0, name: "未分类" }
                        
                        if (!subjectMap.has(subject.id)) {
                          subjectMap.set(subject.id, {
                            id: subject.id,
                            name: subject.name || "未分类",
                            totalTasks: 0,
                            wrongAnswers: 0
                          })
                        }
                        
                        const subjectData = subjectMap.get(subject.id)
                        subjectData.totalTasks++
                        if (homework.wrongAnswers) {
                          subjectData.wrongAnswers += homework.wrongAnswers
                        }
                        
                        subjectMap.set(subject.id, subjectData)
                      })
                      
                      // 转换为数组并渲染
                      const subjects = Array.from(subjectMap.values())
                      
                      if (subjects.length === 0) {
                        return (
                          <div className="col-span-3 py-4 text-center text-gray-500">
                            暂无科目数据
                          </div>
                        )
                      }
                      
                      return subjects.map(subject => {
                        const wrongRate = subject.totalTasks > 0 ? subject.wrongAnswers / subject.totalTasks : 0
                        
                        return (
                          <div key={subject.id} className="p-3 border border-indigo-100 rounded-lg">
                            <div className="text-center">
                              <div className="mb-1 font-medium text-indigo-700">{subject.name}</div>
                              <div className="text-sm text-indigo-600">错题: {subject.wrongAnswers}个</div>
                              <div className="text-sm text-indigo-600">错题率: {Math.round(wrongRate * 100)}%</div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* 错题趋势 */}
                <div className="p-4 bg-white border border-indigo-100 rounded-lg">
                  <h4 className="mb-3 font-medium text-indigo-700">错题趋势分析</h4>
                  <div className="space-y-2">
                    {/* 查找最近有错题的作业 */}
                    {(() => {
                      try {
                        // 按日期排序并筛选有错题的作业
                        const recentHomeworkWithWrongs = [...childHomework]
                          .filter(homework => homework.wrongAnswers && homework.wrongAnswers > 0)
                          .sort((a, b) => {
                            const dateA = new Date(a.date || a.completionDate || 0)
                            const dateB = new Date(b.date || b.completionDate || 0)
                            return dateB - dateA
                          })
                          .slice(0, 5) // 最多显示5条
                        
                        if (recentHomeworkWithWrongs.length === 0) {
                          return (
                            <div className="py-3 text-center text-gray-500">
                              暂无错题数据
                            </div>
                          )
                        }
                        
                        return recentHomeworkWithWrongs.map((homework, index) => {
                          const title = homework.title || 
                                      (homework.subject && homework.subject.name ? homework.subject.name + "作业" : "未命名作业")
                          
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <span className="text-sm">{title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-indigo-600">错题: {homework.wrongAnswers}</span>
                                <Badge
                                  variant="outline"
                                  className={`${
                                    homework.wrongAnswers > 3
                                      ? "bg-red-50 text-red-600"
                                      : homework.wrongAnswers > 1
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-green-50 text-green-600"
                                  }`}
                                >
                                  {homework.wrongAnswers > 3 ? "需要关注" : homework.wrongAnswers > 1 ? "一般" : "良好"}
                                </Badge>
                              </div>
                            </div>
                          )
                        })
                      } catch (err) {
                        console.error("渲染错题趋势时出错:", err)
                        return (
                          <div className="py-3 text-center text-gray-500">
                            数据处理异常，请稍后再试
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>

                {/* 学习建议 */}
                <div className="p-4 bg-white border border-indigo-100 rounded-lg">
                  <h4 className="mb-3 font-medium text-indigo-700">错题学习建议</h4>
                  <ul className="space-y-2 text-sm text-indigo-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 bg-indigo-500 rounded-full"></div>
                      <span>定期检查错题本，帮助孩子复习薄弱知识点</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 bg-indigo-500 rounded-full"></div>
                      <span>分析错题类型，针对性地提供辅导</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 bg-indigo-500 rounded-full"></div>
                      <span>鼓励孩子总结错题规律，提高解题能力</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 bg-indigo-500 rounded-full"></div>
                      <span>对于高频错题，可以设计专项练习进行巩固</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 建议 */}
            <div>
              <h5 className="mb-2 font-medium text-indigo-600">综合建议</h5>
              <div className="p-3 bg-white border border-indigo-100 rounded-lg">
                <ul className="space-y-2 text-sm text-gray-700">
                  {deepAnalysis.weekdayAvgTime > 23 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>工作日完成作业时间较晚，建议提前开始作业，避免影响睡眠。</span>
                    </li>
                  )}
                  {Math.abs(deepAnalysis.weekdayAvgCount - deepAnalysis.weekendAvgCount) > 2 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>工作日与周末作业量差异较大，建议更均衡地分配作业。</span>
                    </li>
                  )}
                  {deepAnalysis.countTrend > 0.5 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>近期作业量有明显增加趋势，注意避免孩子过度疲劳。</span>
                    </li>
                  )}
                  {deepAnalysis.timeTrend > 0.5 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>近期完成作业时间有变晚的趋势，建议关注孩子的学习效率。</span>
                    </li>
                  )}
                  {deepAnalysis.correlation > 0.3 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>作业量与完成时间呈正相关，可能需要提高学习效率。</span>
                    </li>
                  )}
                  {deepAnalysis.lateNights.length > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>存在明显的晚睡情况，建议调整作息时间，保证充足睡眠。</span>
                    </li>
                  )}
                  {deepAnalysis.wrongTrend > 0.2 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>近期错题数量有增加趋势，建议加强薄弱知识点的复习。</span>
                    </li>
                  )}
                  {deepAnalysis.wrongCorrelation > 0.5 && (
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                      <span>错题与作业量高度相关，可能是作业量过大导致注意力不集中。</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-1 bg-green-500 rounded-full"></div>
                    <span>建议每天固定时间开始做作业，养成良好习惯。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

