<template>
  <div class="pg index">
    <Title>Nice's Blog</Title>
    <IndexBanner :bg-img="TODAY_COVER_URL" :blur="false">
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
</template>

<script setup lang="ts">
import { TODAY_COVER_URL } from '~/config/constants';
import '~/feature/request/primary/index';

definePageMeta({ scrollBehavior: false });
</script>
<style lang="scss"></style>
