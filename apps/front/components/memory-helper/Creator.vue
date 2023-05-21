<script setup lang="ts">
import {
  MEMORY_STATUS,
  MemoryHelperEntityResolved,
  type MemoryHelperQuestion,
} from '@blog/entities';
import { debounce, pickByKeys } from '@tool-pack/basic';
import { createMemory, getMemory, updateMemory } from '@blog/apis';
import { ElNotification } from 'element-plus';
import { download, readFile } from '@tool-pack/dom';
import { CreateMemoryHelperDto } from '@blog/dtos';
import { useReactive, useStorageItem, useFileSelector } from '~/feature/hooks';
import useUserStore from '~/store/user.store';

const props = defineProps({
  memoryId: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update', 'update:visible', 'success']);

const show = computed({ get: () => props.visible, set: (v: Boolean) => emit('update:visible', v) });

const [state, _setState] = useReactive({
  isImport: false,
  // update: <Object | false>false,
  mode: 'create' as 'create' | 'edit',
  questionList: [
    {
      question: '',
      answer: '',
      desc: '',
    },
  ] as MemoryHelperQuestion[],
  title: '',
  desc: '',
  questionJson: '',
  memoryId: 0,
});

const tempMemory = useStorageItem<Pick<typeof state, 'title' | 'questionList'>>(
  'tempMemory',
  process.client ? localStorage : null,
);

const userStore = useUserStore();
const route = useRoute();
const [files, triggerFileSelector] = useFileSelector('application/json');

watch(files, (f) => {
  if (!f.length) return;
  const file = f[0];
  readFile(file).then((value) => {
    try {
      const obj: Pick<typeof state, 'title' | 'questionList'> = JSON.parse(value as string);
      if (!value || !validate(obj.title, obj.questionList)) {
        ElNotification({ type: 'error', title: '文件格式不正确' });
        return;
      }
      setState({ questionJson: getFormatStr(value) });
    } catch (e) {
      ElNotification({ type: 'error', title: '文件格式不对' });
    }
  });
});

const setState: typeof _setState = (state) => {
  saveTempMemory();
  console.log('setData...');
  _setState(state);
};

watch(
  () => props.visible,
  (n) => {
    if (!n) return;
    setState({ memoryId: props.memoryId, mode: props.memoryId ? 'edit' : 'create' });
    console.log('--------');
    // 判断是否编辑状态
    if (state.mode === 'edit') {
      // 改标题为编辑
      getMemoryData();
    } else {
      getTempMemory();
    }
  },
);

const getMemoryData = async () => {
  const { data } = await getMemory(props.memoryId);
  console.log(data);
  const obj = pickByKeys(data, ['title', 'desc', 'questionList', 'questionJson']);
  setState(obj);
};

const formatStr = () => {
  setState({ questionJson: getFormatStr(state.questionJson) });
};

const getFormatStr = (content: string | object = state.questionJson) => {
  try {
    if (typeof content === 'string') content = JSON.parse(content);
    return JSON.stringify(content, null, 2);
  } catch (e) {
    ElNotification({
      title: '格式有误',
      type: 'error',
    });
    if (typeof content === 'string') return content;
    return '';
  }
};

const saveTempMemory = debounce(() => {
  console.log('缓存表单...');
  const title = state.title;
  const questionList = state.questionList;
  tempMemory.set({ title, questionList });
}, 600);

// 一次性填充会卡  分批填充到data的questionList
const splitPushToData = (tempQL: MemoryHelperQuestion[]) => {
  const timer = setInterval(() => {
    const questionList = state.questionList;
    Array.prototype.push.apply(questionList, tempQL.splice(0, 10));
    setState({ questionList });
    if (!tempQL.length) {
      clearInterval(timer);
    }
  }, 100);
};

// 获取临时保存的数据
const getTempMemory = () => {
  try {
    const temp = tempMemory.get();
    if (!temp || !temp.title) return;
    let { questionList } = temp;
    // 如果length大于5，则分批填充到data
    if (questionList.length > 5) {
      splitPushToData(questionList.slice(5));
      questionList = questionList.splice(0, 5);
    }
    setState({ title: temp.title, questionList });
  } catch (e) {
    console.log('getTempMemory error', e);
  }
};

// 校验数据是否正确
const validate = (title: string, questionList: MemoryHelperQuestion[]): boolean => {
  // const {title, questionList} = this.data;
  if (!title) {
    ElNotification({ type: 'error', title: '标题不能为空!' });
    return false;
  }
  for (let i = 0; i < questionList.length; i++) {
    const item = questionList[i];
    if (!item.question) {
      ElNotification({ type: 'error', title: `问题${i + 1}不能为空!` });
      return false;
    }
    if (!item.answer) {
      ElNotification({ type: 'error', title: `答案${i + 1}不能为空!` });
      return false;
    }
  }
  return true;
};
const formSubmit = async (e: any) => {
  console.log('form发生了submit事件，携带数据为：', e.detail.value);
  const { title, questionList, mode, desc, memoryId } = state;

  if (!validate(title, questionList)) return;

  if (!userStore.isLogin()) {
    // navigateTo({ path: '/user/login', query: { fromPath: route.fullPath } });
    ElNotification({ type: 'error', title: '未登录' });
    return;
  }

  try {
    const obj: CreateMemoryHelperDto = {
      title,
      desc,
      questionJson: JSON.stringify(questionList),
      status: MEMORY_STATUS.Public,
    };
    if (mode === 'edit') {
      await updateMemory(memoryId, obj);
    } else {
      await createMemory(obj);
    }
    tempMemory.remove();
    emit('success');
    show.value = false;
  } catch (e) {
    console.log(e);
  }
};

// 重置
const formReset = (e: any) => {
  console.log('form发生了reset事件，携带数据为：', e.detail.value);
  const questionList = [
    {
      question: '',
      answer: '',
      desc: '',
    },
  ];
  const title = '';
  if (state.isImport) {
    formatStr();
  } else {
    setState({
      questionList,
      title,
    });
  }
};
const questionListAdd = () => {
  const ml = state.questionList;
  ml.push({
    question: '',
    answer: '',
    desc: '',
  });
};
const questionListDelete = (e: any) => {
  const { index } = e.target.dataset;
  console.log(index);

  const ml = state.questionList;
  ml.splice(index, 1);
};
// 点击编辑
const memoryImport = () => {
  const { title, questionList } = state;
  setState({ isImport: true, questionJson: getFormatStr({ title, questionList }) });
};
const memoryExport = () => {
  const { title, questionJson } = state;

  // 保存文档

  download(`${title}.json`, new Blob([questionJson], { type: 'application/json' }));
};

const back = () => {
  state.isImport = false;
};
// 文件导入页的确定按钮
const confirm = () => {
  const { questionJson } = state;
  try {
    const obj: MemoryHelperEntityResolved = JSON.parse(questionJson);
    if (validate(obj.title, obj.questionList)) {
      if (obj.questionList.length > 5) {
        splitPushToData(obj.questionList.slice(5));
        obj.questionList = obj.questionList.splice(0, 5);
      }
      setState({ isImport: false, ...obj });
    }
  } catch (e) {
    console.log(e);
  }
};
</script>

<template>
  <ClientOnly>
    <el-dialog
      v-model="show"
      class="c-memory-helper-create"
      :title="memoryId ? '编辑' : '新增'"
      append-to-body>
      <el-form>
        <template v-if="!state.isImport">
          <!--标题-->
          <div class="block">
            <section class="page-section">
              <div class="page-section-title">标题</div>
              <div>
                <el-input v-model="state.title" placeholder="输入标题" />
              </div>
            </section>
            <section class="page-section">
              <div class="page-section-title">描述</div>
              <div>
                <el-input
                  v-model="state.desc"
                  type="textarea"
                  class="text-area"
                  placeholder="输入描述(可不填)" />
              </div>
            </section>
          </div>
          <div v-for="(item, index) in state.questionList" :key="index" class="block">
            <!--问题-->
            <section class="page-section">
              <div class="page-section-title">
                问题{{ index + 1 }}
                <div v-if="state.questionList.length > 1" class="del" @click="questionListDelete">
                  <i class="iconfont icon-delete"></i>
                </div>
              </div>
              <div>
                <el-input v-model="item.question" placeholder="输入问题" />
              </div>
            </section>
            <!--答案-->
            <section class="page-section">
              <div class="page-section-title">答案</div>
              <div>
                <el-input v-model="item.answer" placeholder="输入答案" />
              </div>
            </section>
            <!--描述-->
            <section class="page-section">
              <div class="page-section-title">描述</div>
              <div>
                <el-input
                  v-model="item.desc"
                  type="textarea"
                  class="text-area"
                  placeholder="输入描述(可不填)" />
              </div>
            </section>
          </div>
        </template>
        <template v-else>
          <div class="text-area-box">
            <el-input
              v-model="state.questionJson"
              type="textarea"
              :rows="10"
              class="text-area"></el-input>
          </div>
        </template>
      </el-form>
      <!--按钮区域-->
      <div class="btn-area">
        <template v-if="!state.isImport">
          <el-button @click="questionListAdd">新增问题</el-button>
          <el-button @click="memoryImport">编辑JSON</el-button>
          <el-button type="primary" @click="formSubmit">确定</el-button>
        </template>
        <template v-else>
          <el-button @click="triggerFileSelector"> 从文件中导入 </el-button>
          <el-button @click="memoryExport"> 导出到文件 </el-button>
          <el-button @click="formatStr">格式化</el-button>
          <el-button type="primary" @click="confirm">确认</el-button>
          <el-button @click="back">返回</el-button>
        </template>
        <el-button @click="formReset">重置</el-button>
      </div>
    </el-dialog>
  </ClientOnly>
</template>

<style lang="scss">
.c-memory-helper-create {
  padding: 10px;

  .el-form {
    max-height: 70vh;
    overflow: hidden auto;
  }
  .block {
    margin-bottom: 20px;
    border-bottom: 1px solid gray;

    .del {
      float: right;
      padding: 1rem;
      margin: -1rem;
      cursor: pointer;
      &:hover {
        color: red;
      }
    }
  }

  .text-area {
    box-sizing: border-box;
    width: 100%;
  }

  .text-area-box {
    padding: 0 10px;
  }

  .btn-area {
    .el-button {
      margin: 10px 0;
      width: 100%;
    }
  }
}
</style>
