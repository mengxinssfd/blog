<template>
  <Html :class="{ [theme]: isClient || themeMode !== ThemeMode.system }">
    <Body>
      <NuxtLoadingIndicator :height="5" :duration="3000" :throttle="400" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>
<script lang="ts" setup>
import '~/feature/request/primary/index';
import useUserStore from '~/store/user.store';
import 'locss';
import themeSetup, { Theme, ThemeKeys, ThemeMode } from '~/setup/theme.setup';

themeSetup();
const theme = useState<Theme>(ThemeKeys.type);
const themeMode = useState<ThemeMode>(ThemeKeys.mode);
const isClient = process.client;

const userStore = useUserStore();

const handler = () => {
  if (document.hidden) return;
  userStore.getSelfInfo();
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

// 服务端重定向后app会再加载一次，而且缓存被清空了
await userStore.useUser();
</script>
