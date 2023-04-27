<template>
  <ArticleDetailBaseComment ref="baseRef" :item="item" :author-id="authorId">
    <template #operate>
      <!-- 操作 -->
      <div class="operate _ flex-c">
        <!-- 赞 -->
        <div class="btn like" @click="setLike">
          <i class="iconfont" :class="item.like.checked ? 'icon-like2' : 'icon-like1'"></i
          ><span>{{ item.like.count }}</span>
        </div>
        <!-- 踩 -->
        <div class="btn dislike" @click="setDislike">
          <i class="iconfont" :class="item.dislike?.checked ? 'icon-dislike2' : 'icon-dislike1'"></i
          ><span>{{ item.dislike?.count }}</span>
        </div>
        <template v-if="item.user">
          <div v-if="reply" class="btn reply cancel">
            <i class="iconfont icon-huifu"></i><span>取消回复</span>
          </div>
          <div v-else class="btn reply" @click="showReply">
            <i class="iconfont icon-huifu"></i><span>{{ item.children?.length || '回复' }}</span>
          </div>
        </template>
        <client-only>
          <el-popconfirm
            v-if="(user.id && user.id === item.user?.id) || user.role === ROLE.superAdmin"
            confirm-button-text="好的"
            cancel-button-text="不用了"
            title="确定删除？"
            @confirm="deleteComment">
            <template #reference>
              <div class="btn del">删除</div>
            </template>
          </el-popconfirm>
        </client-only>
      </div>
    </template>
    <!--   回复输入框   -->
    <div v-if="reply" class="reply-input-box" @click.stop>
      <el-input
        v-model="form.content"
        type="textarea"
        :placeholder="'回复' + getNickname(item.user)"></el-input>
      <div class="box-bottom">
        <el-button size="small" type="info" :disabled="!form.content" @click="form.content = ''">
          清空
        </el-button>
        <el-button size="small" type="primary" :disabled="!form.content" @click="createComment">
          发表评论
        </el-button>
      </div>
    </div>
    <!-- 子评论  -->
    <div v-if="item.children?.length" class="comm-children">
      <ArticleDetailComment
        v-for="it in item.children"
        :key="it.id"
        :item="it"
        :author-id="authorId"
        @update="$emit('update')"></ArticleDetailComment>
    </div>
  </ArticleDetailBaseComment>
</template>

<script lang="ts">
import * as Vue from 'vue';
import { onceEvent } from '@tool-pack/dom';
import { ElMessage } from 'element-plus';
import { createComment, deleteCommentOne, setCommentDislike, setCommentLike } from '@blog/apis';
import { ROLE, type UserEntity } from '@blog/entities';
import { useToggleState } from '~/feature/hooks';
import useUserStore from '~/store/user.store';
import { CommentTree } from '~/components/article/detail/tree';
import type BaseComment from '~/components/article/detail/BaseComment.vue';

export default defineComponent({
  name: 'Comment',
  props: {
    item: {
      type: Object as Vue.PropType<CommentTree>,
      default() {
        return {
          createAt: '',
          content: '',
          children: [],
          parent: undefined,
          user: {
            id: 1,
            avatar: '', // https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png
            nickname: '',
          },
        };
      },
    },
    authorId: { type: [Number, String], default: '' },
  },
  emits: ['update', 'likeUpdated'],
  setup(props: any, ctx) {
    const [reply, toggleReply] = useToggleState(false);
    const user = ref(useUserStore().user);
    const baseRef = ref<typeof BaseComment>();
    const Data = {
      baseRef,
      user,
      reply,
      ROLE,
      form: reactive({
        content: '',
      }),
    };

    const Methods = {
      getNickname(user: UserEntity) {
        return baseRef.value?.getNickname(user);
      },
      showReply() {
        toggleReply();
        setTimeout(() => onceEvent(window, 'click', () => (reply.value = false)), 50);
        // onceEvent(window, 'click', toggleReply, true);
      },
      async deleteComment() {
        await deleteCommentOne(props.item.id);
        ElMessage({ type: 'success', message: '删除成功！' });
        ctx.emit('update');
      },
      async createComment() {
        const item = props.item;
        await createComment({
          articleId: item.articleId,
          content: Data.form.content,
          replyId: item.id,
          userId: user.value.id,
          parentId: item.parent?.id ?? item.id,
        });
        toggleReply();
        ElMessage({ type: 'success', message: '评论成功！' });
        Data.form.content = '';
        ctx.emit('update');
      },
      async setLike() {
        const { data } = await setCommentLike(props.item.id);
        toRefs(props).item.value.like = data;
        // ctx.emit('likeUpdated',{,})
      },
      async setDislike() {
        const { data } = await setCommentDislike(props.item.id);
        toRefs(props).item.value.dislike = data;
        // ctx.emit('likeUpdated',{,})
      },
    };

    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss" scoped>
.c-comment {
  padding: 16px 0;
  .operate {
    font-size: 12px;
    color: var(--sec-text-color);
    > div {
      margin-right: 10px;
      &:hover {
        color: #409eff;
      }
      i {
        margin-right: 2px;
        font-size: 1.2em;
      }
    }
  }
  .comm-children {
    margin: 10px 0;
    padding: 0 10px;
    background: var(--link-hover-bg-color);
    border-radius: 6px;
  }
  .reply-input-box {
    margin-top: 10px;
    padding: 10px;
    background: var(--board-bg-color);
    .box-bottom {
      margin-top: 10px;
      text-align: right;
    }
  }
}
</style>
