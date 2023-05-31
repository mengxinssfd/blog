<script setup lang="ts">
import { type ArticleEntity } from '@blog/entities';
import { getProjectCategoryList } from '@blog/apis';

const article = ref<ArticleEntity>({} as ArticleEntity);
const dialogVisible = ref(false);
const contentRef = ref<HTMLElement>();

const { data: _data } = await useAsyncData(() => getProjectCategoryList());
const cateList = computed(() =>
  (_data.value?.data.list || []).filter((i) => Boolean(i.projectList?.length)),
);
</script>

<template>
  <ArticleAsPage as="project" @data="article = $event">
    <template #aside>
      <WidgetSentence />
      <WidgetStickyLayout>
        <WidgetArticleTOC :reference="contentRef" />
      </WidgetStickyLayout>
    </template>
    <section ref="contentRef" class="project-list-area board">
      <ul class="cate-list">
        <li v-for="cate in cateList" :key="cate.id">
          <h1 :id="`project-cate-${cate.id}`" class="cate-name">{{ cate.name }}</h1>
          <ul class="project-list">
            <li v-for="project in cate.projectList" :key="project.id">
              <ProjectCard :item="project" />
            </li>
          </ul>
        </li>
      </ul>
      <el-empty v-if="!cateList.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
  <ProjectFormDialog v-model:show="dialogVisible" />
</template>

<style lang="scss" scoped>
.cate-list {
  .cate-name {
    position: relative;
    margin-bottom: 1rem;
    padding: 0 0 0 1rem;
    font-size: 1.5rem;
    font-weight: bolder;

    &:before {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--theme-color);
      content: '';
    }
  }
}
.project-list {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(4, 1fr);
  @media (max-width: 750px) {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
