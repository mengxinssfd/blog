<script setup lang="ts">
import { deleteMemory, getMemory } from '@blog/apis';
import { type MemoryHelperQuestion, ROLE } from '@blog/entities';
import { ElMessageBox } from 'element-plus';
import { MemoryHelperEntity } from '@blog/entities';
import type { PlaySetting } from './types.d';
import useUserStore from '~/store/user.store';

const props = defineProps({
  memoryId: {
    type: Number,
    default: 0,
  },
});

const visible = defineModel('visible', { local: true, type: Boolean, default: false });

const emit = defineEmits(['edit']);

enum PlayMode {
  // 容易
  easy = 'easy',
  // 普通
  common = 'common',
  // 自定义
  custom = 'custom',
}

const playModeList: { key: PlayMode; value: string }[] = [
  { key: PlayMode.easy, value: '容易' },
  { key: PlayMode.common, value: '普通' },
  { key: PlayMode.custom, value: '自定义' },
];

const userStore = useUserStore();
const user = computed(() => userStore.user);
const tempMemory = useStorageItem('tempMemory', process.client ? localStorage : null);
const [state, setState] = useReactive({
  questionList: [] as MemoryHelperQuestion[],
  showPlay: false,
  showCustom: true,
  showSelect: false,
  playModeList,
  pickedPlayModeListIndex: 0,
  setting: {
    canJump: true,
    canShowAnswer: true,
    isReverse: false,
    ignoreUpLow: false,
    // time: 10,
    // totalTime: 60,
  } as PlaySetting,
  currentMemoryIndex: -1,
  memoryId: '',
  memory: {} as MemoryHelperEntity,
});

const getMemoryData = async () => {
  const { data } = await getMemory(props.memoryId);
  setState({ memory: data, questionList: data.questionList.slice() });
};

watch(
  visible,
  (n) => {
    n && getMemoryData();
  },
  { immediate: true },
);

const onDelete = () => {
  const { memory } = state;
  ElMessageBox.confirm(`是否删除'${memory.title}'？`, '删除提示').then(async () => {
    await deleteMemory(memory.id);
    tempMemory.remove();
  });
};
const onStart = () => {
  state.showPlay = !state.showPlay;
};
const selectorSwitch = () => {
  setState({ showSelect: !state.showSelect });
};

const onSelectorFinish = (list: MemoryHelperQuestion[]) => {
  state.questionList = list;
};

const onEdit = () => {
  visible.value = false;
  emit('edit', props.memoryId);
};
</script>

<template>
  <ClientOnly>
    <el-dialog v-model="visible" append-to-body>
      <div class="c-setting">
        <MemoryHelperPlayer
          v-if="state.showPlay"
          :question-list="state.questionList"
          :setting="state.setting"
          @close="onStart"
          @finish="onSelectorFinish" />
        <MemoryHelperSelector
          v-if="state.showSelect"
          :question-list="state.questionList"
          @close="selectorSwitch"
          @finish="onSelectorFinish" />
        <template v-if="state.showCustom">
          <div class="setting">
            自定义配置：
            <div class="content">
              <div class="item">
                <label>
                  可跳过
                  <el-checkbox v-model="state.setting.canJump" />
                </label>
              </div>
              <div class="item">
                <label>
                  可显示答案
                  <el-checkbox v-model="state.setting.canShowAnswer" />
                </label>
              </div>
              <div class="item">
                <label>
                  问题答案反转
                  <el-checkbox v-model="state.setting.isReverse" />
                </label>
              </div>
              <div class="item">
                <label>
                  答案忽略大小写
                  <el-checkbox v-model="state.setting.ignoreUpLow" />
                </label>
              </div>
            </div>
          </div>
        </template>

        <el-button type="primary" @click="onStart">开始</el-button>
        <el-button @click="selectorSwitch">勾选</el-button>
        <el-button @click="onEdit">编辑</el-button>
        <el-button
          :disabled="
            !(
              state.memory.creator &&
              (user.id === state.memory.creatorId || user.role <= ROLE.admin)
            )
          "
          @click="onDelete">
          删除
        </el-button>
      </div>
    </el-dialog>
  </ClientOnly>
</template>

<style lang="scss">
.c-setting {
  padding: 10px;
  color: var(--text-color);

  .picker {
    margin-bottom: 10px;
  }

  .setting {
    margin-bottom: 10px;
    background: rgba(0, 0, 0, 0.05);
    padding: 6px;

    .content {
      padding: 6px;

      .item {
        margin-top: 1rem;

        .el-checkbox {
          margin-left: 6px;
          width: 10px;
          height: 10px;
        }

        &.total-time,
        &.time {
          display: flex;
          align-items: center;

          label {
            flex: 1;
          }

          input {
            flex: 1;
            margin-left: 6px;
            border-bottom: 1px solid white;
            text-indent: 6px;
          }
        }
      }
    }
  }

  .el-button {
    margin: 10px 0;
    width: 100%;
  }
}
</style>
