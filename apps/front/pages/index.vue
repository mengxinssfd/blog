<template>
  <NuxtLayout name="page">
    <template #banner>
      <Banner
        bg-img="https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/1683742789346.webp"
        height="55vh"
        :blur="false"
        :brightness="0.75">
        <template #content>
          <h1 class="page-title">{{ sentence?.hitokoto }}</h1>
          <h2 class="page-desc">
            {{ SentenceCates[sentence?.type] || '其他' }} {{ sentence?.from }}
          </h2>
        </template>
      </Banner>
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import { TODAY_COVER_URL } from '~/config/constants';
import '~/feature/request/primary/index';
import useHeaderStore from '~/store/header.store';
import { useSentence, SentenceCates } from '~/feature/hooks/use-sentence.hook';

// https://gd-hbimg.huaban.com/3124b26222a416c147e0d810c21789f00ba73b3534944-fFJtR4_fw1200webp
// https://gd-hbimg.huaban.com/1f7d7bbb45ea77f75aa5ec60e470d57226af16a2495e4-1Se9uJ_fw1200webp

definePageMeta({ scrollBehavior: false });
useHeaderStore().useTransparent();
const { sentence } = useSentence();
</script>
<style lang="scss"></style>
