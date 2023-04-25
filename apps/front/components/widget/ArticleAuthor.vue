<script setup lang="ts">
import * as Vue from 'vue';
import type { ArticleEntity } from '@blog/entities';

const props = defineProps({
  article: { type: Object as Vue.PropType<ArticleEntity>, default: () => ({ author: {} }) },
});

const link = computed(() => '/user/info/' + props.article.author.id);
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">作者</h5>
    </template>
    <div class="widget-content">
      <nuxt-link :to="link" class="_ flex-col-c">
        <el-avatar :src="article.author.avatar" size="large"></el-avatar>
        <div class="texts _ flex-1">
          <div class="title _ ellipsis-2">{{ article.author.nickname }}</div>
        </div>
      </nuxt-link>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  font-size: 13px;
  .texts {
    margin-top: 6px;
    color: var(--text-color);
    .title {
      font-weight: bold;
    }
  }
}
</style>
