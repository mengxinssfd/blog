<script lang="tsx" setup>
import * as Vue from 'vue';
import Drawer from '~/components/Drawer.vue';

const state = useState('aside.hiddenContent', () => false);
const route = useRoute();

onMounted(() => {
  watch(
    route,
    () => {
      state.value = false;
    },
    { immediate: true }, // false的话watch不生效
  );
});

const Contents = (_props: {}, { slots }: Vue.SetupContext) => {
  return (
    <>
      <aside class="c-aside">{slots.default?.()}</aside>
      <Drawer v-model={state.value} size="300px" z-index={11} direction="rtl">
        {slots.default?.()}
      </Drawer>
    </>
  );
};
</script>
<template>
  <Contents>
    <slot>
      <WidgetLoginUser />
      <!-- <WidgetSentence /> -->
      <WidgetClock />
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
