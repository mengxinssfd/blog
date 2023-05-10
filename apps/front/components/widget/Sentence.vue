<script setup lang="ts">
import { useSentence, SentenceCates } from '~/feature/hooks/use-sentence.hook';

const { sentence } = useSentence();
</script>

<template>
  <Widget remove-title>
    <div v-if="sentence" class="widget-content">
      <div class="text">
        {{ sentence.hitokoto }}
      </div>
      <div class="from">-- {{ SentenceCates[sentence.type] || '其他' }} {{ sentence.from }}</div>
    </div>
    <div v-else class="widget-content">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item style="width: 100%; margin-bottom: 1em" />
          <el-skeleton-item style="width: 50%; margin-left: 50%" />
        </template>
      </el-skeleton>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  .from {
    margin-top: 1rem;
    text-align: right;
    font-size: 13px;
  }
}
</style>
