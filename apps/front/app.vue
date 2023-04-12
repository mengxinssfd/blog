<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script lang="ts" setup>
import '~/feature/request/primary/index';
import useUserStore from '~/store/user';
import 'locss';

const handler = () => {
  if (document.hidden) return;
  useUserStore().getSelfInfo();
};
onMounted(() => {
  if (/(win|mac|android)/i.test(navigator.userAgent)) {
    document.documentElement.classList.add(RegExp.$1.toLowerCase());
  }
  window.addEventListener('visibilitychange', handler);
});
onBeforeUnmount(() => {
  window.removeEventListener('visibilitychange', handler);
});

await useUserStore().getSelfInfo({ enable: !process.server });
</script>
