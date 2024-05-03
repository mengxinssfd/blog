<script setup lang="tsx">
import { getArticleAs } from '@blog/apis';
import type { ArticleEntity } from '@blog/entities';
import useHeaderStore from '~/store/header.store';

useHeaderStore().useTransparent();

const props = defineProps({
  as: {
    type: String,
    default: '',
  },
  layout: {
    type: String as PropType<'default' | 'page' | 'fixed-banner'>,
    default: 'page',
  },
  bannerHeight: {
    type: String,
    default: '55vh',
  },
  commentBlockVisible: {
    type: Boolean,
    default: true,
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

const TitleBlock = () => (
  <>
    <h1 class="page-title">{asArticle.value.title}</h1>
    {asArticle.value.description && asArticle.value.description !== '无' && (
      <h2 class="page-desc">{asArticle.value.description}</h2>
    )}
  </>
);
</script>

<template>
  <Title>Nice's {{ asArticle.title }}</Title>
  <NuxtLayout :name="layout">
    <template #title>
      <slot name="title"><TitleBlock /></slot>
    </template>
    <template #banner>
      <Banner :bg-img="asArticle.cover" :height="bannerHeight" :blur="false" :brightness="0.75">
        <template #content>
          <slot name="banner-content">
            <TitleBlock />
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
      <section v-if="commentBlockVisible && asArticle.id" class="board">
        <CommentBlock :article="asArticle"></CommentBlock>
      </section>
    </div>
  </NuxtLayout>
</template>

<style lang="scss"></style>
