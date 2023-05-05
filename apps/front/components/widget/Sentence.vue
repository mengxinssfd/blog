<script setup lang="ts">
import { useRequest } from '@request-template/vue3-hooks';
import type { ResType } from 'request-template';

const TypeMatches = {
  a: '动画',
  b: '漫画',
  c: '游戏',
  d: '文学',
  e: '原创',
  f: '来自网络',
  g: '其他',
  h: '影视',
  i: '诗词',
  j: '网易云',
  k: '哲学',
  l: '抖机灵',
};

interface Res {
  commit_from: string;
  created_at: string;
  creator: string;
  creator_uid: number;
  from: string;
  from_who: null;
  hitokoto: string;
  id: number;
  length: number;
  reviewer: number;
  type: string;
  uuid: string;
}

async function getData(): Promise<ResType<Res>> {
  const response = await fetch('https://v1.hitokoto.cn');
  return { code: 200, data: await response.json(), msg: 'success' };
}
const { data, request } = useRequest(getData);

onMounted(request);
</script>

<template>
  <Widget remove-title>
    <div v-if="data" class="widget-content">
      <div class="text">
        {{ data.hitokoto }}
      </div>
      <div class="from">-- {{ TypeMatches[data.type] || '其他' }} {{ data.from }}</div>
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
