import { defineStore } from 'pinia';

const useHeaderStore = defineStore('header', () => {
  const mode = ref('default');
  const scrollTop = ref(0);
  const isOnTop = computed(() => scrollTop.value === 0);

  const getScrollTop = () =>
    (scrollTop.value = document.documentElement.scrollTop || document.body.scrollTop);

  onMounted(() => {
    getScrollTop();
    addEventListener('scroll', getScrollTop);
  });

  onBeforeUnmount(() => {
    removeEventListener('scroll', getScrollTop);
  });

  return {
    mode,
    isOnTop,
    useTransparent() {
      onMounted(() => (mode.value = 'transparent'));
      onBeforeUnmount(() => (mode.value = 'default'));
    },
  };
});

export default useHeaderStore;
