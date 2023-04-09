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
import 'locss';

const user: Partial<UserEntity> = { id: 1 };
console.log('1111', user);
</script>
