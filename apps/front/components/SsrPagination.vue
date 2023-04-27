<template>
  <div class="c-pagination el-pagination is-background">
    <button
      class="btn-prev is-first"
      :disabled="page === 1"
      @click="navigateTo(links[Math.max(page - 2, 0)].link)">
      prev
    </button>
    <ul class="_ flex-c el-pager">
      <li
        v-for="link in links"
        :key="link.link"
        class="number"
        :class="{ 'is-active': link.page === page }">
        <nuxt-link :to="link.link">{{ link.page }}</nuxt-link>
      </li>
    </ul>
    <button
      class="btn-next is-last"
      :disabled="page === links.length"
      @click="navigateTo(links[Math.min(page, links.length - 1)].link)">
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
const page = computed(() => Number(route.query.page || 1));
const links = computed<Array<{ page: number; link: string }>>(() => {
  const size = Math.ceil(props.total / props.size);
  return Array(size)
    .fill(1)
    .map((_, index) => {
      const page = index + 1;
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
