<script setup lang="ts">
import { createSays } from '@blog/apis';

const model = defineModel({ type: Boolean, default: false, local: true });
const emit = defineEmits(['created']);

const onCreated = () => {
  model.value = false;
  emit('created');
};
</script>

<template>
  <el-dialog v-model="model">
    <CommentInputBox :api="createSays" :options="{ scope: 'says' }" @created="onCreated" />
  </el-dialog>
</template>

<style lang="scss"></style>
