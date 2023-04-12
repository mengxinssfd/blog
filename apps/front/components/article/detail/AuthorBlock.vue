<script setup lang="ts">
import * as Vue from 'vue';
import { ElMessage } from 'element-plus';
import { download as downloadTool } from '@tool-pack/dom';
import {
  deleteArticle as deleteArticleApi,
  getRawArticleDetail as getRawArticleDetailApi,
  setArticleCommentLock as setArticleCommentLockApi,
} from '@blog/apis';
import { UserEntity, ROLE, ArticleEntity } from '@blog/entities';
import { useRouter } from '#app';
import useUserStore from '~/store/user';

const props = defineProps({
  article: { required: true, type: Object as Vue.PropType<ArticleEntity> },
});
const emits = defineEmits(['commentLockUpdated']);

const user = ref(useUserStore().user);
const author = computed<UserEntity>(() => props.article.author);
const router = useRouter();

async function download() {
  const {
    data: { content, title },
  } = await getRawArticleDetailApi(props.article.id);
  downloadTool(title + '.md', new Blob([content]));
}
async function deleteArticle() {
  await deleteArticleApi(props.article.id);
  ElMessage({ type: 'success', message: '删除成功' });
  setTimeout(() => {
    router.replace('/');
  }, 1000);
}
async function setArticleCommentLock() {
  const res = await setArticleCommentLockApi(props.article.id);
  ElMessage({ type: 'success', message: res.msg });
  emits('commentLockUpdated');
}
</script>

<template>
  <section class="c-author">
    <router-link :to="`/user/info/${author.id}`">
      <div class="avatar img-box">
        <img :src="author.avatar" alt="" />
      </div>
    </router-link>
    <div class="text">
      <div class="nickname">{{ author.nickname }}</div>
      <div class="operate-block _ flex-c">
        <template v-if="user.id === author.id">
          <div class="edit">
            <router-link :to="'/article/create?id=' + article.id">
              <i class="_ btn iconfont icon-edit" title="编辑"></i>
            </router-link>
          </div>

          <div class="lock">
            <i
              class="_ btn iconfont"
              :class="article.commentLock ? 'icon-lock' : 'icon-unlock'"
              title="评论锁"
              @click="setArticleCommentLock"></i>
            <!--<el-switch v-model="commentLock" @change="setArticleCommentLock" />-->
          </div>
          <div class="download">
            <i
              class="_ btn iconfont icon-download shake-vertical"
              title="下载"
              @click="download"></i>
          </div>
        </template>
        <div v-if="user.id === author.id || user.role === ROLE.superAdmin" class="del">
          <client-only>
            <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              title="确定删除?"
              @confirm="deleteArticle">
              <template #reference>
                <i class="_ btn iconfont icon-delete shake-horizontal" title="删除"></i>
              </template>
            </el-popconfirm>
          </client-only>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.c-author {
  display: flex;
  align-items: center;
  .avatar {
    margin-right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
  }
  .nickname {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-color);
  }
  .operate-block {
    margin-top: 10px;
    font-size: 14px;
    color: #909090;
    > div {
      margin-right: 10px;
    }
  }
}
</style>
