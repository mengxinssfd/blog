<template>
  <div>
    <NuxtWelcome />
  </div>
</template>
<script lang="ts" setup>
import type { UserEntity } from '@blog/entities';

const user: Partial<UserEntity> = { id: 1 };
console.log('1111', user);
</script>
