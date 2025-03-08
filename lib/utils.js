import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期时间
 * @param {Date|string} dateTime - 日期时间对象或ISO格式的日期时间字符串
 * @param {string} format - 格式化模式，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  // 如果是字符串，转换为Date对象
  let date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // 如果日期无效，返回原始值
  if (!(date instanceof Date) || isNaN(date)) {
    return dateTime;
  }

  // 转换为中国时区
  const chinaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  date = chinaTime;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // 补零函数
  const pad = (num) => (num < 10 ? '0' + num : num);

  // 替换格式字符串
  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds));
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或ISO格式的日期字符串
 * @param {string} format - 格式化模式，默认为'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return formatDateTime(date, format);
}

