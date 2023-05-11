<template>
  <NuxtLayout name="page">
    <template #banner>
      <Banner
        bg-img="https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/1683759631385.jpg"
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
// https://gd-hbimg.huaban.com/675a9f66318a28882b0c6f4a6f855a00bfd513853ff02-7pxMcW_fw1200webp
// https://gd-hbimg.huaban.com/ad3820a3b20d62a7a5b504270cb8c79257740b0d2cdde-X5zDcv
// https://gd-hbimg.huaban.com/c61b895c30a7f0d5b0f799b8285c899fde17f0af44068-rRktV9_fw1200

definePageMeta({ scrollBehavior: false });
useHeaderStore().useTransparent();
const { sentence } = useSentence();
</script>
<style lang="scss"></style>
