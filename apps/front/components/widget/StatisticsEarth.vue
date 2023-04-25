<script setup lang="ts">
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

<template>
  <Widget title="访问统计">
    <div class="widget-content">
      <div ref="statisticsRef" class="statistics-earth"></div>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  $w: 220px;
  height: $w;
  .statistics-earth {
    margin: auto;
    width: $w;
    height: $w;
  }
}
</style>
