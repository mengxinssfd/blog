<template>
  <div :id="anchor" class="c-says-base" :class="{ active: isActive }">
    <div class="comm-info">
      <!--    顶部信息    -->
      <div class="top">
        <span class="time">{{ howLongAgo(item.createAt) }}</span>
      </div>
      <!--    回复内容    -->
      <div class="content" @click="emits('clickContent')">
        <p><MdViewer class="custom" :content="item.content" is-md /></p>
      </div>
      <slot name="operate"></slot>
    </div>
  </div>
</template>

<script setup lang="tsx">
import * as Vue from 'vue';
import { type SaysEntity } from '@blog/entities';
import { howLongAgo } from '~/feature/utils';

defineOptions({ name: 'SaysBase' });

const route = useRoute();
const props = defineProps({
  item: {
    type: Object as Vue.PropType<SaysEntity>,
    default: () => ({}),
  },
});
const emits = defineEmits(['clickContent']);

const anchor = computed(() => `_says-${props.item.id}`);
const isActive = computed(() => route.hash === '#' + anchor.value);
</script>

<style lang="scss">
@use 'locss';
.c-says-base {
  color: var(--text-color);
  .user-link {
    display: inline-block;
    font-size: 0;
  }

  .top {
    font-size: 12px;
    color: var(--sec-text-color);
    > span {
      margin-right: 10px;
    }
  }
  .content,
  .reply-content {
    margin: 10px 0;
    line-height: 1.5;
    font-size: 14px;
    word-wrap: break-word;
  }
  .reply-content {
    display: inline-flex;
    overflow: hidden;
    margin: 5px 0;
    padding: 5px;
    max-width: 100%;
    background: var(--board-bg-color);
    color: var(--sec-text-color);
    word-wrap: normal;
    border-radius: 6px;
    p {
      flex: 1;
    }
    &:before,
    &:after {
      content: '"';
    }
  }
  &.active {
    border: 1px solid var(--theme-color);
    border-radius: var(--board-radius);
    padding-left: 7px !important;
    margin: 0 -7px;
  }
}
</style>
