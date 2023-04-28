<template>
  <div class="c-comment-input-box">
    <el-input
      v-model.trim="form.content"
      :placeholder="placeholder"
      :rows="4"
      type="textarea"></el-input>
    <div class="btn-block">
      <div v-if="!user.id" class="tourist-name">
        <el-input v-model.trim="form.touristName" placeholder="游客昵称"></el-input>
      </div>
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
    default: '输入评论',
  },
});

const emits = defineEmits(['created']);

const user = computed(() => useUserStore().user);
const form = reactive<Pick<CreateCommentDto, 'content' | 'touristName'>>({
  content: '',
  touristName: '',
});

const clearCommentInput = () => {
  form.content = '';
};
const createComment = async () => {
  await createCommentApi({
    ...props.options,
    ...form,
    articleId: props.articleId,
    userId: user.value.id,
  });
  clearCommentInput();
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
  }
}
</style>