<template>
  <ClientOnly>
    <el-drawer v-model="value" :with-header="false" class="c-drawer" append-to-body v-bind="$attrs">
      <slot></slot>
    </el-drawer>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * 由于el-drawer的modelValue只支持boolean类型，
 * 在tsx组件中使用时传入ref()会报错，传boolean ref.value会丢失响应，
 * 而在vue组件中不会，所以要二次封装才能使用
 *
 * @see {@link https://element-plus.org/zh-CN/component/drawer.html}
 */

const props = defineProps({
  modelValue: {
    type: [Boolean, Object],
    default: false,
  },
});
const emit = defineEmits(['update:modelValue']);

const value = computed({
  get: () => (isRef(props.modelValue) ? props.modelValue.value : props.modelValue) as boolean,
  set: (v: boolean | Record<string, any>) => emit('update:modelValue', v),
});
</script>
<style lang="scss">
.c-drawer {
}
</style>
