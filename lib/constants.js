/**
 * 积分类型枚举
 * 用于标识不同来源的积分变化
 */
export const INTEGRAL_TYPE = {
  HOMEWORK: "01", // 作业积分
  TASK: "02",     // 任务积分
  FAMILY: "03",   // 家庭积分
  REWARD: "04",   // 其他奖励积分
  CONSUME: "05",  // 积分消耗

  // 获取类型描述
  getDescription: function(type) {
    switch (type) {
      case this.HOMEWORK: return "作业";
      case this.TASK: return "任务";
      case this.FAMILY: return "家庭";
      case this.REWARD: return "其他奖励";
      case this.CONSUME: return "消耗";
      default: return "未知类型";
    }
  }
};