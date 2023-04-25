<template>
  <section class="widget board">
    <div v-if="!removeTitle" class="title">
      <slot name="title">
        <h5>{{ title }}</h5>
      </slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  removeTitle: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
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
    margin-bottom: 1rem;
    font-size: 1rem;
  }
}
</style>
