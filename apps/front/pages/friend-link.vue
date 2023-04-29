<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { FriendLinkEntity } from '@blog/entities';
import {
  getResolveFriendLinkList,
  getRecentResolveFriendLink,
  getApplyFriendLinkList,
  getArticleAs,
} from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { howLongAgo } from '~/feature/utils';
import useHeaderStore from '~/store/header.store';

useHeaderStore().useTransparent();
const linkList = ref<FriendLinkEntity[]>([]);
const dialogVisible = ref(false);
const { data: articleAs, request: reqArticleAs } = useRequest(getArticleAs);
const bannerBg = computed(
  () => articleAs.value?.cover || 'https://bu.dusays.com/2022/12/04/638cb7ce7e3f6.jpg',
);

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
const { data: recentData, request: reqRecent } = useRequest(
  getRecentResolveFriendLink,
  undefined,
  defaultData,
);

onMounted(() => {
  reqApply();
  reqRecent();
  reqArticleAs('friend-link');
});
await getData();
</script>

<template>
  <Title>Nice's Blog - 友链</Title>
  <NuxtLayout name="page">
    <template #banner>
      <Banner :blur="false" height="55vh" :brightness="0.75" :bg-img="bannerBg">
        <template #content>
          <div class="title">友链</div>
        </template>
      </Banner></template
    >
    <template #aside>
      <Widget title="添加">
        <div class="add-link" @click="showLinkApplyDialog">
          <div class="_ pos-trans-c-c"></div>
          <div class="_ pos-trans-c-c col"></div>
        </div>
      </Widget>
      <Widget title="互链规则">
        <ul class="rules">
          <li>不添加广告网站和违法网站，博客网站最好在5篇文章以上。</li>
          <li>若域名为公共（二级分发）、免费域名，视站点质量添加。</li>
          <li>博主更喜欢内容有趣的和生活类的博客，会更多地访问博客进行互动并添加到关注列表。</li>
          <li>为了友链的统一性和美观性，昵称过长或包含博客、XX的XX等内容将被简化。</li>
          <li>通常按添加时间进行排序，优秀站点可能会提升顺序。</li>
          <li>若站点长期失联（无法访问）将会删除友链。</li>
          <li>申请友链之前请先添加本站链接。</li>
        </ul>
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
          <li v-for="item in recentData.list" :key="item.id" class="_ flex-c">
            <el-image :src="item.avatar" />
            <div class="texts _ flex-1">
              <div class="name _ ellipsis-1">{{ item.name }}</div>
              <div class="time">{{ howLongAgo(item.createAt) }}</div>
            </div>
          </li>
        </ul>
      </Widget>
    </template>
    <div class="pg friend-link">
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
      <section v-if="articleAs" class="board">
        <CommentBlock :article="{ ...articleAs, author: { id: 1 } }"></CommentBlock>
      </section>
      <ClientOnly>
        <FriendLinkDialog v-model:show="dialogVisible" @success="onSuccess"></FriendLinkDialog>
      </ClientOnly>
    </div>
  </NuxtLayout>
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
  padding-left: 1rem;

  font-size: 14px;
  list-style: decimal;
  li + li {
    margin-top: 10px;
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
.pg.friend-link {
  .link-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
    @media (max-width: 1000px) {
      grid-template-columns: repeat(3, 1fr);
    }
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
}
</style>
