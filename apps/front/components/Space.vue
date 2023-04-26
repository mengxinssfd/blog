<script setup lang="ts">
const props = defineProps({
  width: {
    type: [Number, String],
    default: '1rem',
  },
});
const width = computed(() => (typeof props.width === 'number' ? props.width + 'px' : props.width));
</script>
<template>
  <span class="c-space" :style="{ width: width }"> </span>
</template>

<style lang="scss" scoped>
.c-space {
  display: inline-block;
}
</style>
