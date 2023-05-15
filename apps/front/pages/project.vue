<script setup lang="ts">
import { type ArticleEntity } from '@blog/entities';
import { getProjectList } from '@blog/apis';

const article = ref<ArticleEntity>({} as ArticleEntity);
const dialogVisible = ref(false);

const { data: _data } = await useAsyncData(getProjectList);
const projectList = computed(() => _data.value?.data.list || []);
</script>

<template>
  <ArticleAsPage as="project" @data="article = $event">
    <template #aside>
      <WidgetSentence />
      <WidgetCountdown />
    </template>
    <section class="project-list-area board">
      <ul class="project-list">
        <li v-for="project in projectList" :key="project.id">
          <ProjectCard :item="project" />
        </li>
      </ul>
      <el-empty v-if="!projectList.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
  <ProjectFormDialog v-model:show="dialogVisible" />
</template>

<style lang="scss" scoped>
.project-list {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(4, 1fr);
}
</style>
