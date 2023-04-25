<template>
  <div class="c-comment">
    <div class="comm-left">
      <router-link v-if="item.user" :to="`/user/info/${item.user.id}`">
        <el-avatar :size="32" :src="item.user?.avatar || defaultAvatar"></el-avatar>
      </router-link>
      <el-avatar v-else :size="32" :src="defaultAvatar"></el-avatar>
    </div>
    <div class="comm-right">
      <div class="comm-info">
        <!--    顶部信息    -->
        <div class="top">
          <span class="nickname">{{ getNickname(item.user) }}</span>
          <template v-if="item.reply">
            <span class="reply-text">回复</span>
            <span class="replied-user">{{ getNickname(item.reply.user) }}</span>
          </template>
          <span class="time">{{ formatDate(item.createAt) }}</span>
        </div>
        <!--    回复内容    -->
        <div class="content" :class="{ '_ ellipsis-2': independent }" @click="clickContent">
          <p>{{ item.content }}</p>
        </div>
        <!--    回复引用    -->
        <div
          v-if="(item.parentId && item.parentId !== item.replyId) || item.isOrphan"
          v-show="!independent"
          class="reply-content">
          <p v-if="item.reply" class="_ ellipsis-1">{{ item.reply.content }}</p>
          <p v-else>评论已删除</p>
        </div>
        <slot name="operate"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import * as Vue from 'vue';
import { type UserEntity } from '@blog/entities';
import useUserStore from '~/store/user.store';
import { howLongAgo } from '~/feature/utils';
import { CommentTree } from '~/components/article/detail/tree';

export default defineComponent({
  name: 'Comment',
  compatConfig: {
    INSTANCE_ATTRS_CLASS_STYLE: true,
  },
  props: {
    item: {
      type: Object as Vue.PropType<CommentTree>,
      default() {
        return {};
      },
    },
    // 判断是否是作者
    authorId: { type: [Number, String], default: '' },
    // 独立使用
    independent: { type: Boolean, default: false },
  },
  emits: ['clickContent'],
  setup(props, ctx) {
    const Data = {
      user: useUserStore().user,
      defaultAvatar: 'https://pic1.zhimg.com/50/v2-6afa72220d29f045c15217aa6b275808_hd.jpg',
    };

    const Methods = {
      getNickname(user: UserEntity) {
        if (!user) return props.item.touristName + '(游客)' || '匿名用户';
        if (user.id === props.authorId) return `${user.nickname}(作者)`;
        return user.nickname;
      },
      formatDate: howLongAgo,
      clickContent() {
        ctx.emit('clickContent');
      },
    };

    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-comment {
  display: flex;
  align-items: flex-start;
  color: var(--text-color);
  .c-comment {
    padding: 8px 0;
  }
  > .comm-left {
    margin-right: 10px;
  }
  > .comm-right {
    flex: 1;
    overflow: hidden;
    .top {
      font-size: 12px;
      color: var(--sec-text-color);
      > span {
        margin-right: 10px;
      }
    }
    .content,
    .reply-content {
      margin: 10px 0;
      line-height: 1.5;
      font-size: 14px;
      word-wrap: break-word;
    }
    .reply-content {
      display: inline-flex;
      overflow: hidden;
      margin: 5px 0;
      padding: 5px;
      max-width: 100%;
      background: var(--board-bg-color);
      color: var(--sec-text-color);
      word-wrap: normal;
      border-radius: 6px;
      p {
        flex: 1;
      }
      &:before,
      &:after {
        content: '"';
      }
    }
  }
}
</style>
