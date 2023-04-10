<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script lang="ts" setup>
import '~/feature/request/primary/index';
import type { UserEntity } from '@blog/entities';
import useUserStore from '~/store/user';
import 'locss';

const user: Partial<UserEntity> = { id: 1 };
console.log('1111', user);

onMounted(() => {
  if (/(win|mac|android)/i.test(navigator.userAgent)) {
    document.documentElement.classList.add(RegExp.$1.toLowerCase());
  }
});
await useUserStore().getSelfInfo();
</script>
