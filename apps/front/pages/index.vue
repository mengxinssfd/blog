<template>
  <ArticleAsPage as="index" :comment-block-visible="false">
    <template #banner-content>
      <h1 class="page-title">{{ sentence?.hitokoto }}</h1>
      <h2 class="page-desc">{{ SentenceCates[sentence?.type || '_'] }} {{ sentence?.from }}</h2>
    </template>
    <template #aside>
      <WidgetLoginUser />
      <WidgetClock />
      <WidgetCountdown />
      <WidgetRecentComments />
      <WidgetStatisticsEarth />
    </template>
    <div class="pg index">
      <Title>Nice's Blog</Title>
      <IndexBanner v-if="false" :bg-img="TODAY_COVER_URL" :blur="false">
        <template v-if="false" #bg>
          <img
            v-if="false"
            referrerpolicy="no-referrer"
            src="http://store.xiaojiju.com/store/bg1.jpg"
            alt="" />
        </template>
        <template #content>
          <IndexSearchBox v-if="false" />
        </template>
      </IndexBanner>
      <IndexArticleList />
    </div>
  </ArticleAsPage>
</template>

<script setup lang="ts">
import { TODAY_COVER_URL } from '~/config/constants';
import '~/feature/request/primary/index';
import useHeaderStore from '~/store/header.store';

definePageMeta({ scrollBehavior: false });
useHeaderStore().useTransparent();
const { sentence } = useSentence();
</script>
<style lang="scss"></style>
