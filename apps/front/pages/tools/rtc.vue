<script setup lang="tsx">
import type { ArticleEntity } from '@blog/entities';

const articleAs = ref<ArticleEntity>();
</script>

<template>
  <ArticleAsPage as="tools/rtc" @data="articleAs = $event">
    <template #aside>
      <Widget class="rtc-widget">
        <div
          v-if="articleAs?.content"
          class="record-widget-content"
          v-html="articleAs.content"></div>
        <div v-else class="rules">
          <el-skeleton :rows="6" animated />
        </div>
      </Widget>
    </template>
    <section class="tools-rtc board">
      <RtcFile />
    </section>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
.tools-rtc {
  h2 {
    margin-bottom: 1rem;
    span {
      margin-left: 0.5rem;
      font-size: 12px;
    }
  }
  > section {
    & + section {
      margin-top: 2rem;
    }
  }
}
</style>
