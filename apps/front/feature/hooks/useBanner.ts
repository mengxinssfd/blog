import type { ComputedRef } from 'vue';

export function useBanner(): [ComputedRef<string>, () => void] {
  const scrollTop = ref(0);
  const _Methods = {
    getScrollTop() {
      return document.documentElement.scrollTop || document.body.scrollTop;
    },
    onScroll() {
      scrollTop.value = _Methods.getScrollTop();
    },
    watchScroll() {
      onMounted(() => {
        addEventListener('scroll', _Methods.onScroll);
      });
      onUnmounted(() => {
        removeEventListener('scroll', _Methods.onScroll);
      });
    },
  };

  return [
    computed(() => {
      const max = 100;
      const y = Math.min(max, scrollTop.value / 5);
      return `transform: translate3d(0,${y}px,0);`;
    }),
    _Methods.watchScroll,
  ];
}
