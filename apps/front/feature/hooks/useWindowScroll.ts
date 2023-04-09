import type { Ref } from 'vue';

export function useWindowScroll(): {
  scrollTop: Ref<number>;
  removeHandler: () => void;
  backTop: (options?: ScrollIntoViewOptions) => void;
} {
  const scrollTop = ref(0);
  const getScrollTop = () => document.documentElement.scrollTop || document.body.scrollTop;
  const handler = () => {
    scrollTop.value = getScrollTop();
  };
  onMounted(() => {
    handler();
    window.addEventListener('scroll', handler);
  });
  const removeHandler = () => {
    window.removeEventListener('scroll', handler);
  };
  onBeforeUnmount(removeHandler);
  return {
    scrollTop,
    removeHandler,
    backTop(options) {
      document.body.scrollIntoView({ block: 'start', behavior: 'smooth', ...options });
    },
  };
}
