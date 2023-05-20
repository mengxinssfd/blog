<script setup lang="ts">
import * as Vue from 'vue';
import { dateDiff, randomInt } from '@tool-pack/basic';
import { ElMessageBox, ElNotification } from 'element-plus';
import type { MemoryHelperQuestion } from '@blog/entities';
import type { PlaySetting } from './types.d';
import { useReactive } from '~/feature/hooks';

const props = defineProps({
  questionList: {
    type: Array as Vue.PropType<MemoryHelperQuestion[]>,
    default: () => [],
  },
  setting: {
    type: Object as Vue.PropType<PlaySetting>,
    default: () => ({}),
  },
});

const emit = defineEmits(['finish', 'close']);

interface State {
  title: string;
  qList: MemoryHelperQuestion[];
  inputValue: string;
  isShowAnswer: boolean;
  // 回答正确时去掉勾选
  isRightRemove: boolean;
  isFocus: boolean;
  startTime: number;
  formattedTime: string;
  timer: ReturnType<typeof setInterval> | number;
  activeIndex: number;
}
const [state, setState] = useReactive<State>({
  title: '',
  qList: [],
  activeIndex: 0,
  inputValue: '',
  isShowAnswer: false,
  // 回答正确时去掉勾选
  isRightRemove: false,
  isFocus: true,
  startTime: 0,
  formattedTime: '00:00:00',
  timer: -1,
});

const activeItem = computed<MemoryHelperQuestion>(() => state.qList[state.activeIndex] || {});

const init = (): boolean => {
  const qList = props.questionList.filter((item) => !item.isUnChecked);
  if (!qList.length) {
    ElMessageBox.confirm('请至少勾选一个', '提示').then(onClickMask);
    return false;
  }

  setState({
    qList,
    startTime: Date.now(),
    timer: timeStart(),
  });
  nextTick().then(() => switchQuestion());

  return true;
};

onMounted(init);

// 计时开始
const timeStart = function (): ReturnType<typeof setInterval> {
  return setInterval(() => {
    state.formattedTime = dateDiff(new Date(state.startTime), new Date(), 'hh:mm:ss');
  }, 1000);
};
// 计时结束
const timeEnd = function () {
  clearInterval(state.timer);
};

onBeforeUnmount(timeEnd);
// 勾选答对移除提交事件
const onClickMask = () => {
  emit('close');
};
const onConfirm = () => {
  const { setting } = props;
  let { inputValue } = state;
  const { qList, isRightRemove } = state;
  const { answer, question } = activeItem.value;
  let value = String(setting.isReverse ? question : answer);
  // 忽略大小写
  if (setting.ignoreUpLow) {
    value = value.toLowerCase();
    inputValue = inputValue.toLowerCase();
  }
  if (value === inputValue) {
    ElNotification({
      title: '回答正确',
      message: '回答正确',
      type: 'success',
    });
    // 如果勾选答对移除的话
    if (isRightRemove) {
      activeItem.value.isUnChecked = true;
      if (!init()) {
        return;
      }
    }
    if (qList.length) {
      // 未全部答完
      switchQuestion();
    } else {
      // 已全部答完
      ElMessageBox.confirm('是否重来？', '提示').then(() => init());
    }
  } else {
    // 回答错误
    ElNotification({
      title: 'Error',
      message: '回答错误',
      type: 'error',
    });
    state.inputValue = '';
  }
};
const switchQuestion = () => {
  const { qList } = state;

  if (!qList.length) {
    ElNotification({
      title: 'Error',
      message: '没有可切换的问题',
      type: 'error',
    });
    return;
  }

  const randIndex = randomInt(qList.length - 1);
  const item = qList.splice(randIndex, 1)[0]!;
  qList.push(item);

  setState({
    inputValue: '',
    isFocus: true,
    activeIndex: randIndex,
    isShowAnswer: false,
  });
};
const onJump = function () {
  switchQuestion();
};
const onShowAnswer = function () {
  state.isShowAnswer = !state.isShowAnswer;
};
const bindBlur = function () {
  state.isFocus = false;
};
</script>

<template>
  <div class="c-player">
    <div class="mask" @click="onClickMask"></div>
    <div class="content board">
      <section>
        <div class="time">{{ state.formattedTime }}</div>
        <div class="len">剩余：{{ state.qList.length - 1 }}</div>
      </section>
      <!--   <div class="time-area">
           </div>-->
      <section class="question">
        <span> 问：{{ setting.isReverse ? activeItem.answer : activeItem.question }} </span>
      </section>
      <!--只要focus={{isFocus}}的话，真机输入的时候placeholder就不会消失-->
      <section>
        <el-input
          v-model="state.inputValue"
          type="textarea"
          auto-focus
          class="input-answer"
          placeholder="输入答案"
          @blur="bindBlur" />
      </section>
      <section class="operate _ flex-c">
        <label class="_ flex-c">
          当答对时不再答这题
          <el-checkbox v-model="state.isRightRemove" />
        </label>
        <label class="_ flex-c">
          标记
          <el-checkbox
            :key="state.activeIndex"
            :checked="activeItem.isMark"
            @change="activeItem.isMark = $event" />
        </label>
      </section>
      <section class="btns _ flex">
        <el-button
          class="btn-jump _ flex-1"
          :disabled="!setting.canJump || !state.qList.length"
          @click="onJump">
          跳过
        </el-button>
        <el-button class="btn-confirm _ flex-1" type="primary" @click="onConfirm"> 确定 </el-button>
      </section>
      <section class="answer">
        <el-button class="btn-show-answer" :disabled="!setting.canShowAnswer" @click="onShowAnswer">
          {{ state.isShowAnswer ? '隐藏' : '显示' }}答案
        </el-button>
        <template v-if="state.isShowAnswer">
          <div class="show-answer">
            {{ setting.isReverse ? activeItem.question : activeItem.answer }}
          </div>
          <div class="show-desc">{{ activeItem.desc }}</div>
        </template>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.c-player {
  .mask {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .content {
    position: fixed;
    z-index: 110;
    top: 50%;
    left: 50%;
    width: 600px;
    padding: 1rem;
    transform: translate(-50%, -50%);
    @media (max-width: 750px) {
      width: 100vw;
    }

    .time {
      position: absolute;
      top: 1rem;
      left: 1rem;
      font-size: 0.6em;
    }

    .btn-confirm,
    .btn-jump {
      flex: 1;
    }
    .btn-jump {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }
    .btn-confirm {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
    .input-answer {
      margin-bottom: 10px;
    }
    .len {
      text-align: right;
      margin-bottom: 10px;
      font-size: 0.8em;
    }

    .show-desc {
      margin-top: 6px;
      font-size: 0.8em;
    }
    .show-answer {
      margin-top: 1rem;
    }
    > section {
      &.question {
        margin-bottom: 10px;
        text-align: center;
        > span {
          display: inline-block;
          text-align: left;
        }
      }
      &.operate {
        margin-bottom: 10px;
        display: flex;
        align-content: space-evenly;
        font-size: 0.6em;

        label {
          margin-right: 10px;

          .el-checkbox {
            margin-left: 6px;
          }
        }
      }
      &.answer {
        margin-top: 1rem;
        text-align: center;
      }
    }
  }
}
</style>
