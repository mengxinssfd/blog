<script lang="tsx" setup>
import Drawer from './Drawer.vue';
const state = useState('aside.hiddenContent', () => false);
const Contents = defineComponent({
  setup(_props, { slots }) {
    return () => (
      <>
        <aside class="c-aside">{slots.default?.()}</aside>
        <Drawer
          modelValue={state}
          onUpdate:modelValue={(v: boolean) => (state.value = v)}
          size="300px"
          z-index={11}
          direction="rtl">
          {slots.default?.()}
        </Drawer>
      </>
    );
  },
});
</script>
<template>
  <Contents>
    <slot>
      <WidgetLoginUser />
      <WidgetCountdown />
      <WidgetRecentComments />
      <WidgetStatisticsEarth />
    </slot>
  </Contents>
</template>

<style lang="scss">
.c-aside {
  margin-top: 1rem;
  flex-basis: 300px;
  width: 300px;
  padding-left: 1rem;
  transition: transform 0.5s ease-in-out;
}
</style>
