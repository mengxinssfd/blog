<script setup lang="ts">
import * as Vue from 'vue';
import type { CommentEntity } from '@blog/entities';
import { getArticleCommentLink } from '@blog/shared';
import { UserEntity } from '@blog/entities';
import { howLongAgo } from '~/feature/utils';

const props = defineProps({
  item: {
    type: Object as Vue.PropType<CommentEntity>,
    default() {
      return {};
    },
  },
});

const defaultAvatar = UserEntity.DEFAULT_AVATAR;

const getNickname = (user: any) => {
  if (!user.id) return props.item.touristName + '(游客)' || '匿名用户';
  return user.nickname;
};
</script>
<template>
  <router-link class="c-reply" :to="getArticleCommentLink(item)">
    <div class="comm-left">
      <router-link v-if="item.user?.id" :to="`/user/info/${item.user.id}`">
        <el-avatar :size="32" :src="item.user?.avatar || defaultAvatar"></el-avatar>
      </router-link>
      <el-avatar v-else :size="32" :src="defaultAvatar"></el-avatar>
    </div>
    <div class="comm-right">
      <div class="comm-info">
        <!--    顶部信息    -->
        <div class="top">
          <span class="nickname">{{ getNickname(item.user) }}</span>
          <span class="reply-text">回复于</span>
          <!--    文章标题    -->
          <span class="replied-user">《{{ item.article?.title }}》</span>
          <span class="time">{{ howLongAgo(item.createAt) }}</span>
        </div>
        <!--    回复内容    -->
        <div class="content">
          <p>{{ item.content }}</p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<style lang="scss">
.c-reply {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
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
      padding: 10px 0;
      line-height: 1.5;
      font-size: 14px;
      word-wrap: break-word;
    }
  }
}
</style>
