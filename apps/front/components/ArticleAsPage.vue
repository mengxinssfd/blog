<script setup lang="ts">
import { getArticleAs } from '@blog/apis';
import { ArticleEntity } from '@blog/entities';
import useHeaderStore from '~/store/header.store';

useHeaderStore().useTransparent();

const props = defineProps({
  as: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['data']);

const { data } = await useAsyncData(() => getArticleAs(props.as));
const asArticle = computed(() => ({ ...data.value?.data, author: { id: 1 } } as ArticleEntity));
watch(
  data,
  (n) => {
    n && emit('data', asArticle.value);
  },
  { immediate: true },
);
</script>

<template>
  <Title>Nice's {{ asArticle.title }}</Title>
  <NuxtLayout name="page">
    <template #banner>
      <Banner
        :bg-img="asArticle.cover"
        height="55vh"
        :blur="false"
        :brightness="0.75"
        :content="asArticle.title" />
    </template>
    <template #aside><slot name="aside"></slot></template>
    <div class="pg">
      <slot></slot>
      <section v-if="asArticle.id" class="board">
        <CommentBlock :article="asArticle"></CommentBlock>
      </section>
    </div>
  </NuxtLayout>
</template>

<style lang="scss"></style>
