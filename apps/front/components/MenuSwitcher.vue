<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [Boolean, Object],
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get: () => (typeof props.modelValue === 'boolean' ? props.modelValue : props.modelValue.value),
  set: (value: boolean) => emit('update:modelValue', value),
});
</script>
<template>
  <div class="_ btn c-aside-menu-switcher" :class="{ visible }" @click="visible = !visible">
    <div class="row row-1"></div>
    <div class="row row-2"></div>
    <div class="row row-3"></div>
  </div>
</template>

<style lang="scss">
.c-aside-menu-switcher {
  margin: 0 !important;
  padding: 10px;
  font-size: 1.2rem;
  .row {
    width: 1em;
    height: 2px;
    background: var(--text-color);
    transition: all 0.3s ease-in-out;
    + .row {
      margin-top: 6px;
    }
  }
  &.visible {
    .row-1,
    .row-3 {
      transform-origin: left;
      width: 1.18em;
    }
    .row-2 {
      opacity: 0;
    }
    .row-1 {
      transform: rotateZ(45deg);
    }
    .row-3 {
      transform: rotateZ(-45deg);
    }
  }
}
</style>
