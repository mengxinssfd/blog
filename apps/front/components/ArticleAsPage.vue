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

const audioVisible = ref(true);

const { data } = await useAsyncData(() => getArticleAs(props.as));
const asArticle = computed(() => ({ ...data.value?.data, author: { id: 1 } } as ArticleEntity));

const onCommentLockUpdate = () => {
  data.value && (data.value.data.commentLock = !data.value.data.commentLock);
};

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
      <Banner :bg-img="asArticle.cover" height="55vh" :blur="false" :brightness="0.75">
        <template #content>
          <slot name="banner-content">
            <h1 class="page-title">
              {{ asArticle.title }}
            </h1>
            <h2 v-if="asArticle.description && asArticle.description !== '无'" class="page-desc">
              {{ asArticle.description }}
            </h2>
          </slot>
        </template>
      </Banner>
    </template>
    <template #aside>
      <WidgetArticleOperator
        :as="as"
        :article="asArticle"
        @comment-lock-updated="onCommentLockUpdate" />
      <slot name="aside"></slot>
    </template>
    <audio
      v-if="asArticle.bgm && audioVisible"
      controls
      :src="asArticle.bgm"
      autoplay
      loop
      @error="audioVisible = false"></audio>
    <div class="pg">
      <slot></slot>
      <section v-if="asArticle.id" class="board">
        <CommentBlock :article="asArticle"></CommentBlock>
      </section>
    </div>
  </NuxtLayout>
</template>

<style lang="scss"></style>
