<script setup lang="ts">
import { getArticleList } from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { type ArticleEntity } from '@blog/entities';
import { howLongAgo } from '~/feature/utils';

const route = useRoute();
const { data, loading, request } = useRequest(
  getArticleList,
  { loading: { threshold: 500, immediate: true } },
  { list: [], count: 0 },
);

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
  <Widget title="最新文章">
    <div class="widget-content">
      <ul>
        <template v-if="loading">
          <li v-for="i in list.length || 3" :key="i">
            <el-skeleton animated>
              <template #template>
                <div class="_ flex-c">
                  <el-skeleton-item
                    variant="image"
                    style="margin-right: 6px; width: 56px; height: 56px" />
                  <div class="_ flex-1 flex-col">
                    <el-skeleton-item />
                    <el-skeleton-item style="margin-top: 8px; width: 130px" />
                    <el-skeleton-item style="margin-top: 8px; width: 60px" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </li>
        </template>
        <template v-else>
          <li v-for="item in list" :key="item.id" :class="{ active: item.active }">
            <nuxt-link :to="item.link" class="_ flex">
              <el-avatar
                :src="item.cover"
                :class="{ 'iconfont icon-view': item.active }"
                size="large"
                shape="square"></el-avatar>
              <div class="texts _ flex-1">
                <div class="title _ ellipsis-2">{{ item.title }}</div>
                <div class="time">{{ item.createTime }}</div>
              </div>
            </nuxt-link>
          </li>
        </template>
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
      margin-top: 1rem;
    }
  }
  .el-avatar {
    flex-basis: 56px;
    &.iconfont {
      &:before {
        position: absolute;
        top: 0;
        left: 0;
        color: white;
        background-color: var(--theme-color);
        padding: 0 4px;
        border-bottom-right-radius: 4px;
        border-top-left-radius: 4px;
        content: '\e661';
      }
    }
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
