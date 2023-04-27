<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { FriendLinkEntity } from '@blog/entities';
import { getResolveFriendLinkList } from '@blog/apis';
import { useAsyncData, useRouter } from '#app';
import useUserStore from '~/store/user.store';
import useHeaderStore from '~/store/header.store';

useHeaderStore().useTransparent();
const router = useRouter();
const linkList = ref<FriendLinkEntity[]>([]);
const dialogVisible = ref(false);
const userStore = useUserStore();

async function getData() {
  const { data } = await useAsyncData(() => getResolveFriendLinkList());
  linkList.value = data.value?.data.list || [];
}

function showLinkApplyDialog() {
  if (!userStore.isLogin()) {
    router.push({
      path: '/user/login',
      query: { fromUrl: encodeURIComponent(router.currentRoute.value.fullPath) },
    });
    return;
  }
  dialogVisible.value = true;
}

function onSuccess() {
  ElMessage({ type: 'success', message: '添加成功，待博主核对后才会显示出来' });
}

await getData();
</script>

<template>
  <div class="pg friend-link">
    <Title>Nice's Blog - 友链</Title>
    <Banner
      :blur="false"
      height="50vh"
      :brightness="0.75"
      bg-img="https://s.cn.bing.net/th?id=OHR.Honnavaralavenderfields_ZH-CN8054655091_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp">
      <template #content>
        <div class="title">友链</div>
      </template>
    </Banner>
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
        <li class="add-link" @click="showLinkApplyDialog">
          <div class="_ pos-trans-c-c"></div>
          <div class="_ pos-trans-c-c col"></div>
        </li>
      </ul>
      <el-empty v-else description="暂无友链"> </el-empty>

      <div class="tips">
        tips: 不定期检查友链，根据对等原则，如友链方无本站友链将撤回本站对方友链。
      </div>
    </section>
    <ClientOnly>
      <FriendLinkDialog v-model:show="dialogVisible" @success="onSuccess"></FriendLinkDialog>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.pg.friend-link {
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
    padding: 2rem 1rem;
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
  .tips {
    margin-top: 60px;
    font-size: 12px;
    text-align: center;
  }
  .title {
    font-size: 36px;
  }
  .add-link {
    position: relative;
    border-radius: 10px;
    cursor: pointer;
    min-height: 260px;
    &:hover {
      > div {
        background-color: var(--theme-color);
      }
    }
    > div {
      width: 50px;
      height: 6px;
      background-color: #dcdcdc;
      transition: background-color 0.25ms;
    }
    .col {
      transform: translate(-50%, -50%) rotate(90deg);
    }
  }
}
</style>
