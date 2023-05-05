<script setup lang="ts">
import { getEndOfMonth, getTimePeriodConst } from '@tool-pack/basic';

const now = ref(new Date());
const searchValue = '{ago}';
const hourAgo = computed(() => Number((now.value.getHours() / 24).toFixed(2)));
interface Item {
  template: string;
  percentage: number;
  text: string;
  status: 'success' | 'exception' | 'warning' | '';
  result(now: Date): { ago: number; percentage: number };
}
const list: Array<Item> = [
  {
    template: `今天已过去${searchValue}小时`,
    percentage: 0,
    status: '',
    text: '',
    result(now) {
      const ago = now.getHours() + Number((now.getMinutes() / 60).toFixed(2));
      return { ago, percentage: ago / 24 };
    },
  },
  {
    template: `本周已过去${searchValue}天`,
    percentage: 0,
    status: 'success',
    text: '',
    result(now) {
      const ago = (now.getDay() || 7) - 1 + hourAgo.value;
      return { ago, percentage: ago / 7 };
    },
  },
  {
    template: `本月已过去${searchValue}天`,
    percentage: 0,
    status: 'exception',
    text: '',
    result(now) {
      const dateCount = getEndOfMonth(now).getDate();
      const ago = now.getDate() - 1 + hourAgo.value;
      return { ago, percentage: ago / dateCount };
    },
  },
  {
    template: `今年已过去${searchValue}天`,
    percentage: 0,
    status: 'warning',
    text: '',
    result(now) {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
      const yearDiff = startOfNextYear.getTime() - startOfYear.getTime();
      const dateCount = yearDiff / getTimePeriodConst().day;
      const ago =
        ~~((now.getTime() - startOfYear.getTime()) / getTimePeriodConst().day) + hourAgo.value;
      return { ago, percentage: ago / dateCount };
    },
  },
];

const progressList = computed(() => {
  return list.map<Omit<Item, 'result'>>(({ result, ...rest }) => {
    const res = result(now.value);
    const ago = String(Number(res.ago.toFixed(2)));
    return {
      ...rest,
      percentage: Number((res.percentage * 100).toFixed(2)),
      text: rest.template.replace(searchValue, ago),
    };
  });
});

let timer: ReturnType<typeof setTimeout>;
const updateDate = () => {
  now.value = new Date();
  timer = setTimeout(updateDate, getTimePeriodConst().minute);
};

onMounted(updateDate);
onUnmounted(() => clearTimeout(timer));
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">倒计时</h5>
    </template>
    <div class="widget-content">
      <ul>
        <li v-for="item in progressList" :key="item.text">
          <div>{{ item.text }}</div>
          <el-progress
            text-inside
            :stroke-width="20"
            :percentage="item.percentage"
            :status="item.status">
          </el-progress>
        </li>
      </ul>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  font-size: 13px;
  li {
    margin-top: 1rem;
  }
  :deep(.el-progress) {
    + .el-progress {
      margin-top: 4px;
    }
  }
}
</style>
