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
          <template v-if="item.replyUser">
            <span class="reply-text">回复</span>
            <span class="replied-user">{{ getNickname(item.replyUser) }}</span>
          </template>
          <span class="time">{{ formatDate(item.createAt) }}</span>
        </div>
        <!--    回复内容    -->
        <div class="content">
          <p>{{ item.content }}</p>
        </div>
        <!--    回复引用    -->
        <div
          v-if="(item.parentId && item.parentId !== item.replyId) || item.isOrphan"
          class="reply-content">
          <p v-if="item.reply" class="_ ellipsis-1">{{ item.reply.content }}</p>
          <p v-else>评论已删除</p>
        </div>
        <!-- 操作 -->
        <div class="operate _ flex-c">
          <!-- 赞 -->
          <div class="btn like" @click="setLike">
            <i class="iconfont" :class="item.like.checked ? 'icon-like2' : 'icon-like1'"></i
            ><span>{{ item.like.count }}</span>
          </div>
          <!-- 踩 -->
          <div class="btn dislike" @click="setDislike">
            <i
              class="iconfont"
              :class="item.dislike?.checked ? 'icon-dislike2' : 'icon-dislike1'"></i
            ><span>{{ item.dislike?.count }}</span>
          </div>
          <template v-if="item.user">
            <div v-if="reply" class="btn reply cancel">
              <i class="iconfont icon-huifu"></i><span>取消回复</span>
            </div>
            <div v-else class="btn reply" @click="showReply">
              <i class="iconfont icon-huifu"></i><span>{{ item.children.length || '回复' }}</span>
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
      </div>
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
      <div v-if="item.children && item.children.length" class="comm-children">
        <ArticleDetailComment
          v-for="it in item.children"
          :key="it.id"
          :item="it"
          :author-id="authorId"
          @update="$emit('update')"></ArticleDetailComment>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as Vue from 'vue';
import { onceEvent } from '@tool-pack/dom';
import { ElMessage } from 'element-plus';
import { createComment, deleteCommentOne, setCommentLike, setCommentDislike } from '@blog/apis';
import { type CommentEntity, ROLE } from '@blog/entities';
import { useToggleState } from '~/feature/hooks';
import useUserStore from '~/store/user';
import { howLongAgo } from '~/feature/utils';

export default defineComponent({
  name: 'Comment',
  props: {
    item: {
      type: Object as Vue.PropType<CommentEntity>,
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
    const Data = {
      user,
      reply,
      ROLE,
      form: reactive({
        content: '',
      }),
      defaultAvatar: 'https://pic1.zhimg.com/50/v2-6afa72220d29f045c15217aa6b275808_hd.jpg',
    };

    const Methods = {
      getNickname(user: any) {
        if (!user) return props.item.touristName + '(游客)' || '匿名用户';
        if (user.id === props.authorId) return `${user.nickname}(作者)`;
        return user.nickname;
      },
      formatDate: howLongAgo,
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
<style lang="scss">
.c-comment {
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
      background: var(--link-hover-bg-color);
      .box-bottom {
        margin-top: 10px;
        text-align: right;
      }
    }
  }
}
</style>
