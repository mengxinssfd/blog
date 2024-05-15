import { throttle } from '@tool-pack/basic';
import type { ComputedRef } from '#imports';

/**
 * 计算传输速度的 hook
 *
 * 通过设置 progress，自动算出传输速度
 *
 * @param interval 进度能够设置时候的间隔
 */
export function useNetSpeed(
  interval = 300,
): [
  speed: ComputedRef<number>,
  setSpeedProgress: (progress: number) => void,
  resetProgress: () => void,
] {
  const state = reactive({
    lastProgress: 0,
    lastTime: 0,
    time: 0,
    progress: 0,
  });
  const speed = computed((): number => {
    if (!state.progress) return 0;
    const time = (state.time - state.lastTime) / 1000;
    const p = state.progress - state.lastProgress;
    return p / time;
  });

  return [speed, throttle(setProgress, interval, { leading: true }), resetProgress];

  function resetProgress(): void {
    setProgress(0);
  }
  function setProgress(progress: number): void {
    state.lastProgress = state.progress;
    state.progress = progress;
    state.lastTime = state.time;
    state.time = Date.now();
  }
}
