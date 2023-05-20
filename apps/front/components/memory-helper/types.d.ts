export interface PlaySetting {
  canJump: boolean;
  canShowAnswer: boolean;
  isReverse: boolean;
  time?: number;
  totalTime?: number;
  // 忽略大小写
  ignoreUpLow: boolean;
}
