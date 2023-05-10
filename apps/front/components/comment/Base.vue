<template>
  <div :id="anchor" class="c-comment" :class="{ active: isActive, independent }">
    <div class="comm-left">
      <router-link v-if="item.user" class="user-link" :to="`/user/info/${item.user.id}`">
        <el-avatar :size="32" :src="item.user?.avatar || defaultAvatar"></el-avatar>
      </router-link>
      <el-avatar v-else :size="32" :src="defaultAvatar"></el-avatar>
    </div>
    <div class="comm-right">
      <div class="comm-info">
        <!--    顶部信息    -->
        <div class="top">
          <span class="nickname">{{ getNickname(item) }}</span>
          <ClientOnly><component :is="getUserTag(item.user)" /></ClientOnly>
          <template v-if="item.reply">
            <span class="reply-text">回复</span>
            <span class="replied-user">{{ getNickname(item.reply) }}</span>
            <ClientOnly><component :is="getUserTag(item.reply.user)" /></ClientOnly>
          </template>
          <span class="time">{{ howLongAgo(item.createAt) }}</span>
        </div>
        <!--    回复内容    -->
        <div class="content" @click="emits('clickContent')">
          <p><MdViewer class="custom" :content="item.content" :is-preview="independent" is-md /></p>
        </div>
        <!--    回复引用    -->
        <div
          v-if="(item.parentId && item.parentId !== item.replyId) || item.isOrphan"
          v-show="!independent"
          class="reply-content">
          <p v-if="item.reply" class="_ ellipsis-1">
            <MdViewer class="custom" :content="item.reply.content" is-md is-preview />
          </p>
          <p v-else>评论已删除</p>
        </div>
        <slot name="operate"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="tsx">
import * as Vue from 'vue';
import { type UserEntity } from '@blog/entities';
import type { CommentTreeType } from './tree.d';
import { howLongAgo } from '~/feature/utils';

const route = useRoute();
const props = defineProps({
  item: {
    type: Object as Vue.PropType<CommentTreeType>,
    default: () => ({}),
  },
  // 判断是否是作者
  authorId: { type: [Number, String], default: '' },
  // 独立使用
  independent: { type: Boolean, default: false },
});
const emits = defineEmits(['clickContent']);

const defaultAvatar = 'https://pic1.zhimg.com/50/v2-6afa72220d29f045c15217aa6b275808_hd.jpg';
const anchor = computed(() => `_comment-${props.independent ? 'ind-' : ''}${props.item.id}`);
const isActive = computed(() => route.hash === '#' + anchor.value);

const getNickname = (tree: CommentTreeType) => {
  if (!tree.user) return tree.touristName;
  return tree.user.nickname;
};

const getUserTag = (user?: UserEntity) => {
  if (props.independent) return undefined;
  if (!user)
    return (
      <el-tag size="small" type="info" disable-transitions>
        游客
      </el-tag>
    );
  if (user.id === 1)
    return (
      <el-tag size="small" disable-transitions>
        博主
      </el-tag>
    );
  if (user.id === props.authorId)
    return (
      <el-tag size="small" type="success" disable-transitions>
        作者
      </el-tag>
    );
  return undefined;
};

defineExpose({ getNickname });
</script>

<style lang="scss">
@use 'locss';
.c-comment {
  display: flex;
  align-items: flex-start;
  color: var(--text-color);
  .user-link {
    display: inline-block;
    font-size: 0;
  }
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
  &.active {
    border: 1px solid var(--theme-color);
    border-radius: var(--board-radius);
    padding-left: 7px !important;
    margin: 0 -7px;
  }
  &.independent {
    .content .markdown-body {
      @extend ._, .ellipsis-2;
    }
  }
}
</style>
