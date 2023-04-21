<template>
  <Html :class="{ [theme]: isClient || themeMode !== ThemeMode.system }">
    <Body
      class="antialiased duration-300 transition-colors text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">
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

useUserStore().getSelfInfo({ enable: !process.server });
</script>
