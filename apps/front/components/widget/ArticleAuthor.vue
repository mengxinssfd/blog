<script setup lang="ts">
import * as Vue from 'vue';
import type { ArticleEntity } from '@blog/entities';

defineProps({
  article: { type: Object as Vue.PropType<ArticleEntity>, default: () => ({ author: {} }) },
});
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">作者</h5>
    </template>
    <div class="widget-content">
      <div class="_ flex-col-c">
        <Avatar :user="article.author" />
        <div class="texts _ flex-1">
          <div class="title _ ellipsis-2">{{ article.author.nickname }}</div>
        </div>
      </div>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  .texts {
    margin-top: 10px;
    color: var(--text-color);
    .title {
      font-weight: bolder;
    }
  }
}
</style>
