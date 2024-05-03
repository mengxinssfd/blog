<script setup lang="ts">
import type { ArticleEntity, SaysEntity } from '@blog/entities';
import { getSaysList } from '@blog/apis';
import type { PageVo } from '@blog/dtos/page.vo';
import { getRegionLocation } from '@blog/shared';
import useUserStore from '~/store/user.store';
import { filterBrowser, filterOs } from '~/feature/utils';

const userStore = useUserStore();
const article = ref<ArticleEntity>({} as ArticleEntity);
const dialogVisible = ref(false);
const data = ref<PageVo<SaysEntity>>();

const getData = async () => {
  const { data: _data } = await useAsyncData(() => getSaysList());
  data.value = _data.value?.data;
};

// await refresh();

const says = computed(() => {
  const list = data.value?.list || [];
  if (!list.length) return [];
  return list.map(
    (item) =>
      ({
        ...item,
        os: filterOs(item.os),
        browser: filterBrowser(item.browser),
        region: getRegionLocation(item.region),
      } as SaysEntity),
  );
  // return handleCommentTree(list);
});

const onData = (data: ArticleEntity) => {
  article.value = data;
};

await getData();
</script>

<template>
  <ArticleAsPage as="says" :comment-block-visible="false" @data="onData">
    <template #aside>
      <Widget v-if="userStore.isSuperAdmin" title="添加">
        <div class="widget-content">
          <div class="widget-create-btn" @click="dialogVisible = true"></div>
        </div>
      </Widget>
      <WidgetClock />
      <WidgetCountdown />
    </template>
    <section class="says-list-area">
      <SaysCard v-for="item in says" :key="item.id" :item="item" :author-id="article.author.id" />
      <el-empty v-if="!says.length" description="暂无数据" />
    </section>
  </ArticleAsPage>

  <SaysCreator v-model="dialogVisible" @success="getData" />
</template>

<style lang="scss" scoped></style>
