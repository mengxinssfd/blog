<template>
  <div class="c-comment-input-box">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="编辑" name="edit">
        <el-input
          v-model="form.content"
          :placeholder="placeholder"
          :rows="4"
          :maxlength="800"
          show-word-limit
          type="textarea" />
      </el-tab-pane>
      <el-tab-pane :disabled="!form.content" label="预览" name="preview">
        <div v-if="activeTab === 'preview'" class="preview-block">
          <MdViewer :content="form.content" is-md />
        </div>
      </el-tab-pane>
    </el-tabs>
    <div v-if="!user.id" class="tourist">
      <div class="tourist-name">
        <el-input
          v-model.trim="form.touristName"
          placeholder="游客昵称，未登录时每个页面最多5个评论" />
      </div>
      <div class="tourist-email">
        <el-input
          v-model.trim="form.touristEmail"
          placeholder="邮箱，当评论有回复时会发送通知到该邮箱" />
      </div>
    </div>
    <div class="btn-block">
      <!--      <el-button type="success" :disabled="!form.content" @click="previewVisible = !previewVisible">-->
      <!--        {{ previewVisible ? '编辑' : '预览' }}-->
      <!--      </el-button>-->
      <el-button type="info" :disabled="!form.content" @click="clearCommentInput"> 清空 </el-button>

      <el-button type="primary" :disabled="!form.content" @click="createComment"> 提交 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { createComment as createCommentApi } from '@blog/apis';
import type { CreateCommentDto } from '@blog/dtos';
import useUserStore from '~/store/user.store';
import { onMounted } from '#imports';

const props = defineProps({
  articleId: {
    type: Number,
    default: undefined,
  },
  api: {
    type: Function as Vue.PropType<typeof createCommentApi>,
    default: createCommentApi,
  },
  options: {
    type: Object as Vue.PropType<Pick<CreateCommentDto, 'replyId' | 'parentId' | 'scope'>>,
    default: null,
  },
  placeholder: {
    type: String,
    default: '输入评论，支持 markdown 格式',
  },
});

type Form = Pick<CreateCommentDto, 'content' | 'touristName' | 'touristEmail'>;
const inputCache = useStorageItem<Form>('input-cache', process.server ? null : localStorage);

const emits = defineEmits(['created']);

const user = computed(() => useUserStore().user);
const form = reactive<Form>({ content: '', touristName: '', touristEmail: '' });
const activeTab = ref<'edit' | 'preview'>('edit');

const clearCommentInput = () => {
  form.content = '';
  activeTab.value = 'edit';
};

onMounted(() => {
  const load = inputCache.get(form);
  if (user.value.id) {
    load.touristName = load.touristEmail = '';
  }
  Object.assign(form, load);
});

watch(form, (n) => {
  inputCache.set(n);
});

const createComment = async () => {
  const dto: CreateCommentDto = {
    ...props.options,
    ...form,
    articleId: props.articleId,
    userId: user.value.id,
  };

  await props.api(dto);
  clearCommentInput();
  await nextTick();
  emits('created');
};
</script>
<style lang="scss" scoped>
.c-comment-input-box {
  :deep(.el-tabs__nav) {
    background: var(--link-hover-bg-color);
    padding: 0 1rem;
    border-radius: var(--board-radius) var(--board-radius) 0 0;
  }
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(textarea),
  :deep(.el-input__wrapper) {
    background: var(--link-hover-bg-color);
    border: 0;
    box-shadow: none;
    --el-input-border-radius: var(--board-radius);
  }
  :deep(textarea) {
    border-top-left-radius: 0;
  }
  .tourist {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 1rem;
    margin-top: 10px;
    @media (max-width: 750px) {
      display: block;
      .tourist-email {
        margin-top: 10px;
      }
    }
  }
  .btn-block {
    text-align: right;
    margin: 1rem 0 0;
    @media (max-width: 750px) {
      .tourist-name {
        float: none;
      }
      .el-button {
        display: block;
        width: 100%;
        margin-top: 10px;
        margin-left: 0;
      }
    }
  }
  .preview-block {
    padding: 5px 11px;
    border-radius: var(--board-radius);
    border-top-left-radius: 0;
    background-color: var(--link-hover-bg-color);
    .markdown-body {
      padding: 0;
    }
  }
}
</style>
