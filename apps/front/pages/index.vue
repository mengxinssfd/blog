<template>
  <div class="pg index">
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
    <div ref="statisticsRef" class="statistics-earth"></div>
    <IndexArticleList />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from '#imports';
import { TODAY_COVER_URL } from '~/config/constants';
import '~/feature/request/primary/index';

definePageMeta({ scrollBehavior: false });
const statisticsRef = ref<HTMLDivElement>();

onMounted(() => {
  const script = document.createElement('script');
  script.async = true;
  script.src =
    'https:////rf.revolvermaps.com/0/0/6.js?i=5te3u6n7t1j&amp;m=7&amp;c=e63100&amp;cr1=ffffff&amp;f=arial&amp;l=0&amp;bv=90&amp;lx=-420&amp;ly=420&amp;hi=20&amp;he=7&amp;hc=a8ddff&amp;rs=80';
  script.type = 'text/javascript';
  statisticsRef.value?.appendChild(script);
});
</script>
<style lang="scss">
.statistics-earth {
  display: inline-block;
  $w: 260px;
  width: $w;
  height: $w;
  margin-top: -$w;
  margin-left: 30px;
  @media (max-width: 600px) {
    display: none;
  }
}
</style>
