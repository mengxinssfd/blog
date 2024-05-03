import type { Ref } from 'vue';

export function useVisibleObserver(
  cb: Function,
  target: Ref<HTMLElement | undefined>,
  once = false,
) {
  const intersectionObserver: IntersectionObserver | undefined = process.server
    ? undefined
    : new IntersectionObserver((entries) => {
        // 如果 intersectionRatio 为 0，则目标在视野外，
        if (entries[0].intersectionRatio <= 0) return;
        cb();
        once && cancel();
      });

  const cancel = () => intersectionObserver?.disconnect();

  watch(target, (n) => n && intersectionObserver?.observe(n), { immediate: true });

  onBeforeUnmount(cancel);
  return { cancel };
}
