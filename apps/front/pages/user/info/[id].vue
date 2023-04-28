<script setup lang="ts">
import { debounce, formatDate } from '@mxssfd/ts-utils';
import { ElMessageBox } from 'element-plus';
import {
  getArticleListByCommentUser,
  getArticleListByLikeUser,
  getArticleListByAuthor,
  restoreArticle as restoreArticleApi,
  getUserById,
  getReplyMeList,
} from '@blog/apis';
import type { UserEntity, ArticleEntity } from '@blog/entities';
import { useRoute } from '#app';
import { useToggleState } from '~/feature/hooks';
import useUserStore from '~/store/user.store';

enum TabTypes {
  article = 'article',
  like = 'like',
  comment = 'comment',
  reply = 'reply',
}

const route = useRoute();
const getUserId = () => Number(route.params.id);
const [listLoading, toggleListLoading] = useToggleState(true);
const [userLoading, toggleUserLoading] = useToggleState(false);
const debToggleListLoading = debounce(toggleListLoading, 500);
const TabStr = JSON.stringify([
  {
    label: '文章',
    value: TabTypes.article,
    total: '',
  },
  {
    label: '点赞',
    value: TabTypes.like,
    total: '',
  },
  {
    label: '评论',
    value: TabTypes.comment,
    total: '',
  },
]);
const tabs = ref<{ label: string; value: TabTypes; total: number | string }[]>([]);
const loginUser = ref(useUserStore().user);
const user = ref({} as UserEntity);
const activeTag = ref<TabTypes>(TabTypes.article);
const articleList = ref<ArticleEntity[]>([]);
const replyList = ref<any[]>([]);
const page = reactive({
  current: 1,
  total: 0,
});
const updateInfoDialogVisible = ref(false);
const UpdatePasswordDialogVisible = ref(false);

async function getUser() {
  toggleUserLoading();
  const res = await getUserById(getUserId());
  res.data.loginAt && (res.data.loginAt = formatDate(new Date(res.data.loginAt)));
  user.value = res.data;
  toggleUserLoading();
  getList();
}
async function restoreArticle() {
  try {
    const id = await ElMessageBox.prompt('输入文章id', '恢复文章', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^\d+$/,
      inputErrorMessage: 'Invalid Number',
    });
    await restoreArticleApi(id.value);
    await getList();
  } catch (e) {
    console.log(e);
  }
}
function showEditPasswordDialog() {
  UpdatePasswordDialogVisible.value = true;
}
function showEditUserInfoDialog() {
  updateInfoDialogVisible.value = true;
}
async function getList() {
  toggleListLoading(true);
  const match: Record<TabTypes, Function> = {
    [TabTypes.like]: getArticleListByLikeUser,
    [TabTypes.comment]: getArticleListByCommentUser,
    [TabTypes.article]: getArticleListByAuthor,
    [TabTypes.reply]: getReplyMeList,
  };
  const type = activeTag.value;
  const fn = match[type];
  const id = +getUserId();
  const res = await fn(id, { page: page.current });
  debToggleListLoading();
  page.total = res.data.count || 0;
  const find = tabs.value.find((i) => i.value === type);
  find && (find.total = page.total);
  if (type !== TabTypes.reply) {
    articleList.value = res.data.list || [];
    return;
  }
  replyList.value = res.data.list || [];
}
function onClickTab() {
  articleList.value = [];
  page.current = 1;
  page.total = 0;
  nextTick(getList);
}

watch([loginUser, user], () => {
  const _loginUser: UserEntity = loginUser.value || {};
  const _user: UserEntity = user.value || {};

  if (_loginUser.id === _user.id) {
    tabs.value.push({
      label: '回复',
      value: TabTypes.reply,
      total: '',
    });
  }
});
watch(
  route,
  (n) => {
    if (/^\/user\/info\/\d+/.test(n.path)) {
      tabs.value = JSON.parse(TabStr) as any;
      activeTag.value = tabs.value[0].value;
      getUser();
    }
  },
  { immediate: true },
);
</script>

<template>
  <Title>Nice's Blog - 用户中心</Title>
  <NuxtLayout name="page">
    <div class="pg user-info board">
      <section v-if="user.id" v-loading="userLoading" class="info _ flex-c">
        <div class="left img-box">
          <img :src="user.avatar" alt="" />
        </div>
        <div class="center">
          <div class="nickname">{{ user.nickname }}</div>
          <div v-if="false" class="role">
            <i class="iconfont icon-user"></i> <span>{{ user.role }}</span>
          </div>
          <div class="login-at">
            <i class="iconfont icon-update-at"></i> <span>{{ user.loginAt }}</span>
          </div>
        </div>
        <div v-if="loginUser.id === user.id" class="right">
          <el-button type="danger" @click="showEditPasswordDialog">
            修改密码
          </el-button>
          <el-button type="warning" @click="showEditUserInfoDialog">
            编辑资料
          </el-button>
          <el-button type="info" @click="restoreArticle"> 恢复文章 </el-button>
        </div>
      </section>
      <section v-loading="listLoading" class="contents">
        <el-tabs v-model="activeTag" @tab-click="onClickTab">
          <el-tab-pane
            v-for="item in tabs"
            :key="item.value"
            :label="`${item.label}${item.total ? '(' + item.total + ')' : ''}`"
            :name="item.value"></el-tab-pane>
        </el-tabs>
        <div class="list">
          <!--回复-->
          <template v-if="activeTag === TabTypes.reply">
            <ul v-if="replyList.length">
              <li v-for="item in replyList" :key="item.id">
                <UserReply :item="item"></UserReply>
              </li>
            </ul>
          </template>
          <!--非回复-->
          <template v-else>
            <template v-if="articleList.length">
              <IndexCard v-for="item in articleList" :key="item.id" :item="item"></IndexCard>
            </template>
          </template>
          <el-empty
            v-if="!(articleList.length || (activeTag === TabTypes.reply && replyList.length))"
            v-show="!listLoading"
            description="暂无数据"></el-empty>
        </div>
        <div v-if="page.total" class="page _ flex-c-c">
          <el-pagination
            v-model:currentPage="page.current"
            layout="prev, pager, next"
            :total="page.total"
            @current-change="getList">
          </el-pagination>
        </div>
      </section>

      <UserUpdateInfoDialog
        v-model:show="updateInfoDialogVisible"
        :user="user"
        @updated="getList" />
      <UserUpdatePasswordDialog v-model:show="UpdatePasswordDialogVisible" :user="user" />
    </div>
  </NuxtLayout>
</template>

<style lang="scss">
.pg.user-info {
  section {
    width: 100%;
    padding: 20px;
    &.info {
      display: flex;
      .left {
        flex-basis: 90px;
        width: 90px;
        height: 90px;
        img {
          border-radius: 50%;
        }
      }
      .center {
        flex: 1;
        margin-left: 20px;
        .nickname {
          margin-bottom: 0.5rem;
          font-size: 2.167rem;
          font-weight: 600;
          line-height: 1.2;
          color: var(--text-color);
        }
      }
      .right {
        align-self: flex-end;
      }
    }
    &.contents {
      flex: 1;
      .list {
        li {
          margin-top: 20px;
        }
      }
      .page {
        margin: 20px 0;
        text-align: center;
      }
    }
    @media (max-width: 750px) {
      padding: 0;
      &.info {
        display: block;
        > div {
          margin: 0 auto 1rem !important;
          text-align: center;
        }
        .left {
          width: 50%;
          height: auto;
        }
      }
    }
  }
}
.edit-user-info-dialog {
  .avatar-view {
    margin-top: 10px;
    width: 60px;
  }
}
</style>
