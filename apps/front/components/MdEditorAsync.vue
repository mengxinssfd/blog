<script setup lang="ts">
/**
 * 因为MdEditor导入的组件不能在server中用，所以额外包一层
 */

const model = defineModel({ type: String, required: true });
const editor = shallowRef();

defineProps({
  height: {
    type: String,
    default: '600px',
  },
});

onBeforeMount(() => {
  import('~/components/MdEditor.vue').then((res) => (editor.value = res.default));
});
</script>

<template>
  <ClientOnly>
    <component :is="editor" v-model:value="model" :height="height" />
  </ClientOnly>
</template>
