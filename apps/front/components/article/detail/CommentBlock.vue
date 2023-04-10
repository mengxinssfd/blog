<template>
  <section class="c-comment-block main-width">
    <div class="write">
      <el-input
        v-model.trim="comment.form.content"
        placeholder="输入评论"
        :rows="4"
        type="textarea"></el-input>
      <div class="btn-block">
        <div v-if="!user.id" class="tourist-name">
          <el-input v-model.trim="comment.form.touristName" placeholder="游客昵称"></el-input>
        </div>
        <el-button type="info" :disabled="!comment.form.content" @click="clearCommentInput">
          清空
        </el-button>
        <el-button type="primary" :disabled="!comment.form.content" @click="createComment">
          提交
        </el-button>
      </div>
    </div>
    <div class="total">全部评论({{ comment.count }})</div>
    <div v-if="article.author" class="list">
      <ArticleDetailComment
        v-for="item in comment.list"
        :key="item.id"
        :item="item"
        :author-id="article.author.id"
        @update="onCommentUpdate"></ArticleDetailComment>
    </div>
  </section>
</template>

<script lang="ts">
import * as Vue from 'vue';
import { ElMessage } from 'element-plus';
import { forEachRight } from '@tool-pack/basic';
import { createComment, getCommentByArticle } from '@blog/apis';
import { type ArticleEntity, CommentEntity, ROLE } from '@blog/entities';
import useUserStore from '~/store/user';

export default defineComponent({
  name: 'CommentBlock',
  props: {
    article: {
      required: true,
      type: Object as Vue.PropType<ArticleEntity>,
    },
  },
  setup(props: any) {
    const Data = {
      ROLE,
      user: ref(useUserStore().$state),
      comment: reactive({
        list: [] as CommentEntity[],
        count: 0,
        form: {
          content: '',
          touristName: '',
        },
      }),
    };
    const _Methods = {
      async getComment() {
        const {
          data: { list = [], count = 0 },
        } = await getCommentByArticle(props.article.id);

        // 组装成二级树结构
        const finalList: any[] = [];
        const idMap: any = {};
        const children = list.filter((item: any) => {
          idMap[item.id] = item;
          item.children = [];
          if (!item.parentId) {
            finalList.push(item);
            return false;
          }
          return true;
        });

        const orphans: any[] = [];
        forEachRight(children, (child: any) => {
          const parent = idMap[child.parentId] || idMap[child.replyId];
          if (!parent) {
            child.isOrphan = true;
            orphans.push(child);
            return;
          }
          parent.children.push(child);
          child.parent = parent;
          if (child.parentId !== child.replyId) {
            child.reply = idMap[child.replyId];
          }
        });

        finalList.push(...orphans.reverse());

        Data.comment.list = finalList;
        Data.comment.count = count;
      },
    };
    const Methods = {
      clearCommentInput() {
        Data.comment.form.content = '';
      },
      onCommentUpdate() {
        _Methods.getComment();
      },
      async createComment() {
        await createComment({
          ...Data.comment.form,
          articleId: props.article.id,
          userId: Data.user.value.id,
        });
        Methods.clearCommentInput();
        ElMessage({ type: 'success', message: '评论成功！' });
        await _Methods.getComment();
      },
    };
    (function () {
      _Methods.getComment();
    })();
    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-comment-block {
  margin-top: 30px;
  textarea {
    background: var(--input-bg-color);
    border: 0;
  }
  .tourist-name {
    width: 200px;
    float: left;
  }
  .btn-block {
    text-align: right;
    margin: 30px 0 60px;
  }
}
</style>
