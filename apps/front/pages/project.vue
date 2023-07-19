<script setup lang="ts">
import { type ArticleEntity } from '@blog/entities';
import { getProjectCategoryList } from '@blog/apis';

const article = ref<ArticleEntity>({} as ArticleEntity);
const dialogVisible = ref(false);
const contentRef = ref<HTMLElement>();
const collapseValue = ref<number[]>([]);

const { data: _data } = await useAsyncData(() => getProjectCategoryList());

const cateList = computed(() =>
  (_data.value?.data.list || []).filter((i) => Boolean(i.projectList?.length)),
);
watch(
  cateList,
  (c) => {
    collapseValue.value = c.map((i) => i.id);
  },
  { immediate: true },
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
      <el-collapse v-model="collapseValue" class="cate-list">
        <el-collapse-item v-for="cate in cateList" :key="cate.id" :name="cate.id">
          <template #title>
            <h1 :id="`project-cate-${cate.id}`">
              {{ cate.name }}
            </h1>
            <span>({{ cate.projectList.length }})</span>
          </template>
          <ul class="project-list">
            <li v-for="project in cate.projectList" :key="project.id">
              <ProjectCard :item="project" />
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
      <el-empty v-if="!cateList.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
  <ProjectFormDialog v-model:show="dialogVisible" />
</template>

<style lang="scss" scoped>
.cate-list {
  --el-collapse-border-color: rgba(0, 0, 0, 0);
  :deep {
    .el-collapse-item + .el-collapse-item {
      margin-top: 1rem;
    }
    .el-collapse-item__header {
      position: relative;
      padding: 0 0 0 1rem;
      $h: 30px;
      height: $h;
      line-height: $h;
      font-size: 1.2rem;
      h1 {
        font-weight: bolder;
        + span {
          margin-left: 6px;
          font-size: 1rem;
        }
      }
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
    .el-collapse-item__content {
      padding: 1rem 0;
    }
  }
}
.project-list {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(4, 1fr);
  padding: 0 0.5rem;
  @media (max-width: 750px) {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
