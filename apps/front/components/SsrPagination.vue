<template>
  <div class="c-pagination el-pagination is-background">
    <button
      class="btn-prev is-first"
      :disabled="pageCurrent === 1"
      @click="navigateTo(links[Math.max(pageCurrent - 2, 0)].link)">
      prev
    </button>
    <ul class="_ flex-c el-pager">
      <li
        v-for="link in links"
        :key="link.link"
        class="number"
        :class="{ 'is-active': link.page === pageCurrent }">
        <nuxt-link :to="link.link">{{ link.page }}</nuxt-link>
      </li>
    </ul>
    <button
      class="btn-next is-last"
      :disabled="pageCurrent === links.length"
      @click="navigateTo(links[Math.min(pageCurrent, links.length - 1)].link)">
      next
    </button>
  </div>
</template>
<script setup lang="ts">
import { setUrlQuery } from '@tool-pack/basic';
import { navigateTo, useRoute } from '#app';
import { computed } from '#imports';

const props = defineProps({
  // page: { type: Number, default: 1 },
  size: { type: Number, default: 1 },
  total: { type: Number, default: 1 },
});

const route = useRoute();
const pageTotal = computed(() => Math.ceil(props.total / props.size));
const pageCurrent = computed(() => Number(route.query.page || 1));
const links = computed<Array<{ page: number; link: string }>>(() => {
  let offsetStart = pageCurrent.value - 2;
  let offsetEnd = pageCurrent.value + 2;

  if (offsetStart < 1) {
    offsetEnd -= offsetStart - 1;
  } else if (offsetEnd > pageTotal.value) {
    offsetStart -= offsetEnd - pageTotal.value;
  }

  const pageStart = Math.max(offsetStart, 1);
  const pageEnd = Math.min(offsetEnd, pageTotal.value);
  return Array(pageEnd - pageStart + 1)
    .fill(1)
    .map((_, index) => {
      const page = pageStart + index;
      const link = setUrlQuery({ page }, route.fullPath);
      return { page, link };
    });
});
</script>

<style scoped lang="scss">
.c-pagination {
  li,
  button {
    padding: 0;
  }
  a {
    pointer-events: initial !important;
    color: inherit;
    width: 100%;
    height: 100%;
    user-select: none;
  }
  li.is-active,
  button[disabled] {
    pointer-events: none;
  }
}
</style>
