<script setup lang="tsx">
import * as Vue from 'vue';
import { type MemoryHelperQuestion } from '@blog/entities';

const props = defineProps({
  questionList: {
    type: Array as Vue.PropType<MemoryHelperQuestion[]>,
    default: () => [],
  },
});
const emit = defineEmits(['finish', 'close']);

const qsList = ref<MemoryHelperQuestion[]>(props.questionList);
const selectCount = ref(0);

const setSelectCount = (_qlist?: MemoryHelperQuestion[]) => {
  const qList = _qlist || qsList.value;
  selectCount.value = qList.filter((i) => !i.isUnChecked).length;
};
setSelectCount(props.questionList);

watch(qsList, setSelectCount);

const bindCheckedChange = (index: number) => {
  const currentQues = qsList.value[index];
  currentQues.isUnChecked = !currentQues.isUnChecked;
  qsList.value[index] = currentQues;
};
// 全选或全不选
const onCheckAll = (type: 'all' | 'clear') => {
  const map = { all: false, clear: true };
  const isUnChecked = map[type];
  qsList.value = qsList.value.map((item) => {
    const newItem = { ...item };
    newItem.isUnChecked = isUnChecked;
    return newItem;
  });
};
// 选中取消已标记
const onSelectMark = (type: 'all' | 'clear') => {
  const map = { all: false, clear: true };
  const isUnChecked = map[type];
  qsList.value = qsList.value.map((item) => {
    const newItem = { ...item };
    if (item.isMark) {
      newItem.isUnChecked = isUnChecked;
    }
    return newItem;
  });
};
const onReverse = () => {
  qsList.value = qsList.value.map((item) => {
    const newItem = { ...item };
    newItem.isUnChecked = !newItem.isUnChecked;
    return newItem;
  });
};
const onOk = () => {
  // 第二个参数是detail
  emit('finish', qsList.value);
  onBack();
};
const onBack = () => {
  emit('close');
};

const ReverseCheckbox = (props: { modelValue?: boolean }, ctx: Vue.SetupContext) => {
  const checked = ref(!props.modelValue);
  // return <el-checkbox v-model={[checked,'modelValue']} />;
  return (
    <el-checkbox
      model-value={checked.value}
      onChange={(e: boolean) => ctx.emit('update:modelValue', !e)}
    />
  );
};
</script>

<template>
  <div class="c-qs-select board">
    <div class="list-area">
      <template v-for="(item, index) in qsList" :key="`${index}`">
        <div class="q-item" :data-index="index" @click="bindCheckedChange(index)">
          <text>{{ index + 1 }}</text>
          <div class="content">
            <div>问：{{ item.question }}</div>
            <div>答：{{ item.answer }}</div>
            <div>描述：{{ item.desc ? item.desc : '无' }}</div>
          </div>
          <div class="operate">
            <ReverseCheckbox v-model="item.isUnChecked" />
            <!--            <el-checkbox-->
            <!--              :model-value="!item.isUnChecked"-->
            <!--              @change="item.isUnChecked = !$event"></el-checkbox>-->
            <div v-if="item.isMark" class="mark">已标记</div>
          </div>
        </div>
      </template>
    </div>
    <div class="btn-area">
      <div class="count">{{ selectCount }}/{{ qsList.length }}</div>
      <el-button @click="onCheckAll('all')">全选</el-button>
      <!--<el-button @click="onCheckAll('clear')">全不选</el-button>-->
      <el-button @click="onReverse">反选</el-button>
      <el-button @click="onSelectMark('all')">选中已标记</el-button>
      <el-button @click="onSelectMark('clear')">取消已标记</el-button>
      <el-button type="primary" @click="onOk">确定</el-button>
      <el-button @click="onBack">返回</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.c-qs-select {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  .list-area {
    padding: 0 10px;
    overflow-y: auto;
    .q-item {
      position: relative;
      padding: 10px;
      border-bottom: 1px solid #fffeee;
      background: rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      &:nth-child(odd) {
        background: rgba(0, 0, 0, 0.1);
      }
      text {
        font-size: 0.6em;
      }
      .content {
        flex: 1;
        margin: 0 8px;
        font-size: 0.8em;
      }
      .operate {
        display: flex;
        font-size: 0.4em;
        .mark {
          position: absolute;
          top: 0;
          right: 0;
        }
      }
    }
  }
  .btn-area {
    flex: 1;
    width: 100%;
    padding-top: 10px;
    .count {
      margin-bottom: 10px;
      padding: 0 10px;
      text-align: right;
    }
    .el-button {
      margin: 10px 0;
    }
  }
}
</style>
