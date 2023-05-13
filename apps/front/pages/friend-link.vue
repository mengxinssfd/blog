<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { FriendLinkEntity, ArticleEntity } from '@blog/entities';
import {
  getResolveFriendLinkList,
  getRecentResolveFriendLink,
  getApplyFriendLinkList,
} from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { howLongAgo } from '~/feature/utils';
import useUserStore from '~/store/user.store';

const userStore = useUserStore();
const linkList = ref<FriendLinkEntity[]>([]);
const dialogVisible = ref(false);
const articleAs = ref<ArticleEntity>();

async function getData() {
  const { data } = await useAsyncData(() => getResolveFriendLinkList());
  linkList.value = data.value?.data.list || [];
}

function showLinkApplyDialog() {
  dialogVisible.value = true;
}

function onSuccess() {
  ElMessage({ type: 'success', message: '添加成功，待博主核对后才会显示出来' });
}

const defaultData = { list: [], count: 0 };

const { data: applyData, request: reqApply } = useRequest(
  getApplyFriendLinkList,
  undefined,
  defaultData,
);
const {
  data: recentData,
  loading: recentDataLoading,
  request: reqRecent,
} = useRequest(
  getRecentResolveFriendLink,
  { loading: { immediate: true, threshold: 500 } },
  defaultData,
);

onBeforeMount(() => {
  reqApply();
  reqRecent();
});
await getData();
</script>

<template>
  <ArticleAsPage as="friend-link" @data="articleAs = $event">
    <template #banner-content>
      <h1 class="page-title">{{ articleAs.title }}</h1>
      <h2 class="page-desc">
        ~~ 与 <strong>{{ linkList.length }}</strong> 位博主同行 ~~
      </h2>
    </template>
    <template #aside>
      <Widget class="pre-bg-long-top-right" title="添加">
        <div class="add-link" @click="showLinkApplyDialog">
          <div class="_ pos-trans-c-c"></div>
          <div class="_ pos-trans-c-c col"></div>
        </div>
      </Widget>
      <Widget>
        <template #title>
          <div class="_ flex-c-between">
            <span>互链规则</span>
            <NuxtLink
              v-if="userStore.isSuperAdmin && articleAs"
              :to="`/article/create?id=${articleAs.id}`">
              <i class="iconfont icon-edit _ btn"></i>
            </NuxtLink>
          </div>
        </template>
        <div v-if="articleAs?.content" class="rules" v-html="articleAs.content"></div>
        <div v-else class="rules">
          <el-skeleton :rows="6" animated />
        </div>
      </Widget>
      <Widget v-if="applyData.list.length" title="添加列表">
        <ul class="apply-list">
          <li v-for="item in applyData.list" :key="item.id" class="_ flex-c">
            <el-image :src="item.avatar" />
            <div class="texts _ flex-1">
              <div class="link">{{ item.link }}</div>
              <div class="time">{{ howLongAgo(item.createAt) }}</div>
            </div>
          </li>
        </ul>
      </Widget>
      <Widget title="最新添加">
        <ul class="recent-list">
          <template v-if="recentDataLoading">
            <li v-for="i in recentData.list.length || 3" :key="i">
              <el-skeleton animated>
                <template #template>
                  <div class="_ flex-c">
                    <el-skeleton-item
                      variant="image"
                      style="margin-right: 10px; width: 40px; height: 40px" />
                    <div class="_ flex-1 flex-col">
                      <el-skeleton-item style="width: 130px" />
                      <el-skeleton-item style="margin-top: 1rem; width: 60px" />
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </li>
          </template>
          <template v-else>
            <li v-for="item in recentData.list" :key="item.id" class="_ flex-c">
              <el-image :src="item.avatar" />
              <div class="texts _ flex-1">
                <div class="name _ ellipsis-1">{{ item.name }}</div>
                <div class="time">{{ howLongAgo(item.createAt) }}</div>
              </div>
            </li>
          </template>
        </ul>
      </Widget>
    </template>
    <section class="board main-width">
      <div class="sort-desc _ pos-rel">
        按友链申请时间排序
        <div v-if="false" class="_ btn apply abs-r" @click="showLinkApplyDialog">
          <ClientOnly>
            <el-tooltip content="添加我的网站到友链" placement="top">
              <i class="_ pos-trans-c-c iconfont icon-apply"></i>
            </el-tooltip>
          </ClientOnly>
        </div>
      </div>
      <ul v-if="linkList.length" class="link-list">
        <li v-for="link in linkList" :key="link.id">
          <FriendLinkCard :item="link"></FriendLinkCard>
        </li>
      </ul>

      <el-empty v-else description="暂无友链"> </el-empty>
    </section>
    <ClientOnly>
      <FriendLinkDialog v-model:show="dialogVisible" @success="onSuccess"></FriendLinkDialog>
    </ClientOnly>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
.apply-list,
.recent-list {
  font-size: 14px;
  .texts {
    overflow: hidden;
  }
  li + li {
    margin-top: 1rem;
  }
  .el-image {
    margin-right: 10px;
    width: 40px;
    flex-basis: 40px;
    height: 40px;
  }
  .time {
    margin-top: 6px;
    font-size: 12px;
  }
}
.rules {
  :deep(ol) {
    padding-left: 1rem;
    font-size: 14px;
    list-style: decimal;
    li + li {
      margin-top: 10px;
    }
  }
}
.title {
  font-size: 36px;
}
.add-link {
  position: relative;
  border-radius: 10px;
  cursor: pointer;
  min-height: 60px;
  &:hover {
    > div {
      background-color: var(--theme-color);
    }
  }
  > div {
    width: 30px;
    height: 3px;
    background-color: #dcdcdc;
    transition: background-color 0.25ms;
  }
  .col {
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
.link-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 1rem;
  > li {
    > div {
      box-shadow: 0 0 20px 1px rgba(0, 0, 0, 0.05);
    }
    transition: transform 0.3s ease-in-out;
    &:hover {
      transform: translateY(-10px);
    }
  }
  //@media (max-width: 1000px) {
  //  grid-template-columns: repeat(3, 1fr);
  //}
  @media (max-width: 750px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: repeat(1, 1fr);
  }
}
.board {
  .btn.apply {
    bottom: -10px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--text-color);
    color: var(--board-bg-color);
    i {
      font-size: 30px;
    }
    animation: heart-beat 1.3s both infinite;
    &:hover {
      animation-play-state: paused;
      opacity: 1 !important;
    }
  }
}
.sort-desc {
  margin-bottom: 1rem;
}
</style>
