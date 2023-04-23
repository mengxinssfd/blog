<script setup lang="ts">
import { getArticleList } from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { type ArticleEntity } from '@blog/entities';
import { howLongAgo } from '~/feature/utils';

const route = useRoute();
const { data, request } = useRequest(getArticleList, undefined, { list: [], count: 0 });

interface InnerEntity extends ArticleEntity {
  link: string;
  active: boolean;
  createTime: string;
}
const list = computed(() => {
  const path = route.path;
  return data.value.list.map((item) => {
    const link = '/article/detail/' + item.id;
    return { ...item, link, active: path === link, createTime: howLongAgo(item.createAt) };
  }) as InnerEntity[];
});

onMounted(() => request({ page: 1, pageSize: 5, tags: [], sort: 1 }, !!process.client));
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">最新文章</h5>
    </template>
    <div class="widget-content">
      <ul>
        <li v-for="item in list" :key="item.id" :class="{ active: item.active }">
          <nuxt-link :to="item.link" class="_ flex" external>
            <el-avatar :src="item.cover" size="large" shape="square"></el-avatar>
            <div class="texts _ flex-1">
              <div class="title _ ellipsis-2">{{ item.title }}</div>
              <div class="time">{{ item.createTime }}</div>
            </div>
          </nuxt-link>
        </li>
      </ul>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  font-size: 13px;
  li {
    position: relative;
    &.active {
      pointer-events: none;
      &:before {
        position: absolute;
        top: 0;
        left: 0;
        color: white;
        background-color: red;
        padding: 0 4px;
        border-bottom-right-radius: 4px;
        border-top-left-radius: 4px;
        content: 'cur';
      }
    }
    &:not(.active) {
      cursor: pointer;
      &:hover {
        .title {
          color: var(--theme-color);
        }
      }
    }
    + li {
      margin-top: 10px;
    }
  }
  .el-avatar {
    flex-basis: 56px;
  }
  .texts {
    overflow-x: hidden;
    margin-left: 6px;
    color: var(--text-color);
  }
  .title {
    min-height: 36px;
  }
  .time {
    margin-top: 4px;
    color: #949494;
  }
}
</style>