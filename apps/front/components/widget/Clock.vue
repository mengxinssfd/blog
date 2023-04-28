<script setup lang="tsx">
import { formatDate } from '@tool-pack/basic';

const now = ref(new Date());
const times = computed(() => {
  const n = now.value;
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map((i) => String(i).padStart(2, '0'));
});
const dates = computed(() => {
  const n = now.value;
  return [n.getFullYear(), n.getMonth() + 1, n.getDate()].map((i) => String(i).padStart(2, '0'));
});

const day = computed(() => formatDate(now.value, '周w'));

const timer = ref();
const handler = () => {
  now.value = new Date();
  timer.value = setTimeout(handler, 1000);
};

onMounted(handler);
onBeforeUnmount(() => clearTimeout(timer.value));

const List = (props: { list: string[] }) => (
  <ul class="_ flex-c-c">
    {props.list.map((item) => (
      <li>{item}</li>
    ))}
  </ul>
);
</script>
<template>
  <Widget remove-title>
    <ClientOnly>
      <div class="widget-content">
        <div class="time">
          <List :list="times" />
        </div>
        <div class="date _ flex-c">
          <List :list="dates" />
          {{ day }}
        </div>
      </div>
    </ClientOnly>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  .time {
    font-size: 50px;
    font-weight: bold;
    :deep(li) {
      + li {
        &:before {
          content: ':';
        }
      }
    }
  }
  .date {
    justify-content: flex-end;
    :deep(li) {
      + li {
        &:before {
          content: '-';
        }
      }
    }
    ul {
      margin-right: 6px;
    }
  }
}
</style>
