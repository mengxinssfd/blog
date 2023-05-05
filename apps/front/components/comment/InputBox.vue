<template>
  <div class="c-comment-input-box">
    <div v-if="previewVisible" class="preview-block">
      <MdViewer :content="form.content" is-md />
    </div>
    <el-input
      v-else
      v-model="form.content"
      :placeholder="placeholder"
      :rows="4"
      :maxlength="800"
      show-word-limit
      type="textarea"></el-input>
    <div class="btn-block">
      <div v-if="!user.id" class="tourist-name">
        <el-input v-model.trim="form.touristName" placeholder="游客昵称"></el-input>
      </div>
      <!--      <el-button type="success" :disabled="!form.content" @click="previewVisible = !previewVisible">-->
      <!--        {{ previewVisible ? '编辑' : '预览' }}-->
      <!--      </el-button>-->
      <el-switch
        v-model="previewVisible"
        :disabled="!form.content"
        active-text="预览"
        inactive-text="预览"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        size="large"
        inline-prompt />
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
import { useStorageItem } from '~/feature/hooks';
import { onMounted } from '#imports';

const props = defineProps({
  articleId: {
    required: true,
    type: Number,
  },
  options: {
    type: Object as Vue.PropType<Pick<CreateCommentDto, 'replyId' | 'parentId'>>,
    default: null,
  },
  placeholder: {
    type: String,
    default: '输入评论，支持 markdown 格式',
  },
});

type Form = Pick<CreateCommentDto, 'content' | 'touristName'>;
const inputCache = useStorageItem<Form>('input-cache', process.server ? null : localStorage);

const emits = defineEmits(['created']);

const user = computed(() => useUserStore().user);
const form = reactive<Form>({ content: '', touristName: '' });
const previewVisible = ref(false);

const clearCommentInput = () => {
  form.content = '';
  previewVisible.value = false;
};

onMounted(() => {
  const load = inputCache.get(form);
  if (user.value.id) load.touristName = '';
  Object.assign(form, load);
});

watch(form, (n) => {
  inputCache.set(n);
});

const createComment = async () => {
  await createCommentApi({
    ...props.options,
    ...form,
    articleId: props.articleId,
    userId: user.value.id,
  });
  clearCommentInput();
  await nextTick();
  emits('created');
};
</script>
<style lang="scss" scoped>
.c-comment-input-box {
  :deep(textarea) {
    background: var(--link-hover-bg-color);
    border: 0;
    box-shadow: none;
  }
  .tourist-name {
    width: 200px;
    float: left;
  }
  .btn-block {
    text-align: right;
    margin: 1rem 0;
    .el-switch {
      margin-right: 10px;
    }
    @media (max-width: 750px) {
      .el-switch {
        margin-right: 0;
      }
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
    background-color: var(--link-hover-bg-color);
    .markdown-body {
      padding: 0;
    }
  }
}
</style>
