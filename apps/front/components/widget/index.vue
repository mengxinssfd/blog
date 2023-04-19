<template>
  <section class="widget board">
    <div class="title">
      <slot name="title"></slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  sticky: {
    type: Boolean,
    default: false,
  },
  top: {
    type: [Number, String],
    default: '',
  },
});
</script>
<style lang="scss" scoped>
.widget {
  max-width: 300px;
  margin-top: 0;
  margin-bottom: 1rem;
  .title {
    margin-bottom: 10px;
    font-size: 1.2rem;
    font-weight: bold;
  }
}
</style>
