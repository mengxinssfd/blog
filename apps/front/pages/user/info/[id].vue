<template>
  <div class="pg user-info">
    <Title>Nice's Blog - 用户中心</Title>
    <Banner height="50vh" :bg-img="user.avatar"></Banner>
    <div class="pg-content main-width">
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
          <el-button size="small" @click="showEditPasswordDialog"> 修改密码 </el-button>
          <el-button size="small" @click="showEditUserInfoDialog"> 编辑资料 </el-button>
          <el-button size="small" @click="restoreArticle"> 恢复文章 </el-button>
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
            v-if="!(articleList.length || replyList.length)"
            v-show="!listLoading"
            description="暂无数据"></el-empty>
        </div>
        <div v-if="page.total" class="page _ flex-c-c">
          <el-pagination
            v-model:currentPage="page.current"
            background
            layout="prev, pager, next"
            :total="page.total"
            @current-change="getList">
          </el-pagination>
        </div>
      </section>
    </div>

    <UserUpdateInfoDialog v-model:show="updateInfoDialogVisible" :user="user" @updated="getList" />
    <UserUpdatePasswordDialog v-model:show="UpdatePasswordDialogVisible" :user="user" />
  </div>
</template>

<script lang="ts">
import { debounce, formatDate } from '@mxssfd/ts-utils';
import { ElMessageBox } from 'element-plus';
import {
  getArticleListByCommentUser,
  getArticleListByLikeUser,
  getArticleListByAuthor,
  restoreArticle,
  getUserById,
  getReplyMeList,
} from '@blog/apis';
import type { UserEntity, ArticleEntity } from '@blog/entities';
import { useRoute } from '#app';
import { useToggleState } from '~/feature/hooks';
import useUserStore from '~/store/user';

export default defineComponent({
  setup() {
    const route = useRoute();
    const getUserId = () => route.params.id as string;
    const [listLoading, toggleListLoading] = useToggleState(true);
    const [userLoading, toggleUserLoading] = useToggleState(false);
    enum TabTypes {
      article = 'article',
      like = 'like',
      comment = 'comment',
      reply = 'reply',
    }
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
    const Data = {
      TabTypes,
      tabs: ref<{ label: string; value: TabTypes; total: number | string }[]>([]),
      loginUser: ref(useUserStore().$state),
      user: ref({} as UserEntity),
      activeTag: ref<TabTypes>(TabTypes.article),
      articleList: ref<ArticleEntity[]>([]),
      replyList: ref<any[]>([]),
      listLoading,
      userLoading,
      page: reactive({
        current: 1,
        total: 0,
      }),
      updateInfoDialogVisible: ref(false),
      UpdatePasswordDialogVisible: ref(false),
    };
    const _Methods = {
      async getUser() {
        toggleUserLoading();
        const res = await getUserById(getUserId());
        res.data.loginAt && (res.data.loginAt = formatDate(new Date(res.data.loginAt)));
        Data.user.value = res.data;
        toggleUserLoading();
        Methods.getList();
      },
    };

    const Methods = {
      async restoreArticle() {
        try {
          const id = await ElMessageBox.prompt('输入文章id', '恢复文章', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^\d+$/,
            inputErrorMessage: 'Invalid Number',
          });
          await restoreArticle(id.value);
          await Methods.getList();
        } catch (e) {
          console.log(e);
        }
      },
      showEditPasswordDialog() {
        Data.UpdatePasswordDialogVisible.value = true;
      },
      showEditUserInfoDialog() {
        Data.updateInfoDialogVisible.value = true;
      },
      async getList() {
        toggleListLoading(true);
        const match: Record<TabTypes, Function> = {
          [TabTypes.like]: getArticleListByLikeUser,
          [TabTypes.comment]: getArticleListByCommentUser,
          [TabTypes.article]: getArticleListByAuthor,
          [TabTypes.reply]: getReplyMeList,
        };
        const type = Data.activeTag.value;
        const fn = match[type];
        const id = +getUserId();
        const res = await fn(id, { page: Data.page.current });
        debToggleListLoading();
        Data.page.total = res.data.count || 0;
        const find = Data.tabs.value.find((i) => i.value === type);
        find && (find.total = Data.page.total);
        if (type !== TabTypes.reply) {
          Data.articleList.value = res.data.list || [];
          return;
        }
        Data.replyList.value = res.data.list || [];
      },
      onClickTab() {
        Data.articleList.value = [];
        Data.page.current = 1;
        Data.page.total = 0;
        nextTick(Methods.getList);
      },
    };
    const init = () => {
      watch([Data.loginUser, Data.user], () => {
        const loginUser: UserEntity = Data.loginUser.value || {};
        const user: UserEntity = Data.user.value || {};

        if (loginUser.id === user.id) {
          Data.tabs.value.push({
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
            Data.tabs.value = JSON.parse(TabStr) as any;
            Data.activeTag.value = Data.tabs.value[0].value;
            _Methods.getUser();
          }
        },
        { immediate: true },
      );
    };
    init();
    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.pg.user-info {
  .pg-content {
    position: relative;
    margin-top: -20px;
    width: 100%;
    background: var(--board-bg-color);
    border-radius: var(--board-radius);
    box-shadow: var(--board-shadow);
  }
  section {
    width: 100%;
    padding: 20px;
    + section {
    }
    &.info {
      display: flex;
      .left {
        flex: 0 0 90px;
        height: 90px;
        img {
          border-radius: 50%;
        }
      }
      .center {
        flex: 1;
        margin-left: 20px;
        .nickname {
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
      .el-tabs {
        .el-tabs__item:not(.is-active) {
          color: var(--link-hover-color);
        }
        .el-tabs__nav-wrap::after {
          height: 1px;
          background: var(--border-color);
          display: none;
        }
      }
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
  }
}
.edit-user-info-dialog {
  .avatar-view {
    margin-top: 10px;
    width: 60px;
  }
}
</style>
