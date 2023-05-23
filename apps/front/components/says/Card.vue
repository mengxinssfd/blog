<template>
  <CommentBase
    ref="baseRef"
    class="board says-comment"
    :item="item"
    :author-id="authorId"
    independent
    is-says>
    <template #operate>
      <div class="device-info _ flex-c">
        <!-- 位置 -->
        <div v-if="item.region && item.region !== '--'" class="location _ flex-c">
          <el-icon><LocationInformation /></el-icon>
          <span>{{ item.region }}</span>
        </div>
        <div v-if="item.os" class="location _ flex-c">
          <el-icon><Platform /></el-icon>
          <span>{{ item.os }}</span>
        </div>
        <div v-if="item.browser" class="location _ flex-c">
          <el-icon><ChromeFilled /></el-icon>
          <span>{{ item.browser }}</span>
        </div>
      </div>
      <!-- 操作 -->
      <div class="operate _ flex-c">
        <!-- 赞 -->
        <div class="btn like" @click="setLike">
          <i class="iconfont" :class="item.like.checked ? 'icon-like2' : 'icon-like1'"></i
          ><span>{{ item.like.count }}</span>
        </div>
        <div v-if="reply" class="btn reply cancel">
          <i class="iconfont icon-huifu"></i><span>取消回复</span>
        </div>
        <div v-else class="btn reply" @click="showReply">
          <i class="iconfont icon-huifu"></i><span>{{ item.children?.length || '回复' }}</span>
        </div>
        <client-only>
          <el-popconfirm
            v-if="(user.id && user.id === item.user?.id) || user.role === ROLE.superAdmin"
            confirm-button-text="好的"
            cancel-button-text="不用了"
            title="确定删除？"
            @confirm="deleteComment">
            <template #reference>
              <div class="btn del"><i class="iconfont icon-delete"></i><span>删除</span></div>
            </template>
          </el-popconfirm>
        </client-only>
      </div>
    </template>
    <!--   回复输入框   -->
    <div v-if="reply" class="reply-input-box" @click.stop>
      <CommentInputBox
        :placeholder="'回复 ' + getNickname(item)"
        :article-id="item.articleId"
        :options="{ replyId: item.id, parentId: item.parent?.id ?? item.id, scope: 'says' }"
        @created="onCommentCreated"></CommentInputBox>
    </div>
    <!-- 子评论  -->
    <div v-if="item.children?.length" class="comm-children">
      <CommentTree
        v-for="it in item.children"
        :key="it.id"
        :item="it"
        :author-id="authorId"
        scope="says"
        @update="$emit('update')"></CommentTree>
    </div>
  </CommentBase>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { onceEvent } from '@tool-pack/dom';
import { deleteCommentOne, setCommentLike } from '@blog/apis';
import { ROLE } from '@blog/entities';
import { LocationInformation, Platform, ChromeFilled } from '@element-plus/icons-vue';
import type BaseComment from './Base.vue';
import useUserStore from '~/store/user.store';
import { type CommentTreeType } from '~/feature/utils';

const props = defineProps({
  item: {
    type: Object as Vue.PropType<CommentTreeType>,
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
});
const emits = defineEmits(['update', 'likeUpdated']);

const [reply, toggleReply] = useToggleState(false);
const user = ref(useUserStore().user);
const baseRef = ref<typeof BaseComment>();

const getNickname = (tree: CommentTreeType) => {
  return baseRef.value?.getNickname(tree);
};
const showReply = () => {
  toggleReply();
  setTimeout(() => onceEvent(window, 'click', () => (reply.value = false)), 50);
};
const deleteComment = async () => {
  await deleteCommentOne(props.item.id);
  emits('update');
};
const onCommentCreated = () => {
  toggleReply();
  emits('update');
};
const setLike = async () => {
  const { data } = await setCommentLike(props.item.id);
  toRefs(props).item.value.like = data;
  // ctx.emit('likeUpdated',{,})
};
</script>
<style lang="scss" scoped>
.c-comment.says-comment {
  padding: 1rem;
  .operate {
    font-size: 12px;
    color: var(--sec-text-color);
    > div {
      margin-right: 10px;
      i {
        margin-right: 2px;
        font-size: 1.2em;
      }
    }
  }
  .device-info {
    justify-content: flex-end;
    margin: 1rem 0;
    font-size: 12px;
    //font-family: system-ui;
    color: var(--sec-text-color);
    :deep(.el-icon) {
      margin-right: 2px;
    }
    > div {
      margin-right: 1rem;
    }
    @media (min-width: 750px) {
      margin-bottom: -1.1rem;
    }
  }
  --padding: 1rem;
  .comm-children {
    margin: var(--padding) 0;
    padding: var(--padding);
    background: var(--link-hover-bg-color);
    border-radius: 6px;
  }
  .reply-input-box {
    margin-top: var(--padding);
    padding: var(--padding);
    background: var(--board-bg-color);
    .box-bottom {
      margin-top: var(--padding);
      text-align: right;
    }
  }
  @media (max-width: 750px) {
    --padding: 10px;
  }
}
</style>
