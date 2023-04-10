<template>
  <div class="pg friend-link">
    <Title>Nice's Blog - 友链</Title>
    <Banner
      :blur="false"
      height="50vh"
      bg-img="https://s.cn.bing.net/th?id=OHR.FraueninselChiemsee_ZH-CN3541482552_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp">
      <template #content>
        <div class="title">友链</div>
        <div class="tips">不定期检查友链，如友链方无本站友链将撤回本站对方友链。</div>
      </template>
    </Banner>
    <section class="board main-width">
      <div class="_ btn apply abs-r" @click="showLinkApplyDialog">
        <ClientOnly>
          <el-tooltip content="添加我的网站到友链" placement="top">
            <i class="_ pos-trans-c-c iconfont icon-apply"></i>
          </el-tooltip>
        </ClientOnly>
      </div>

      <ul v-if="linkList.length">
        <li v-for="link in linkList" :key="link.id">
          <FriendLinkCard :item="link"></FriendLinkCard>
        </li>
      </ul>
      <el-empty v-else description="暂无友链"></el-empty>
    </section>
    <ClientOnly>
      <FriendLinkDialog v-model:show="dialogVisible" @success="onSuccess"></FriendLinkDialog>
    </ClientOnly>
  </div>
</template>

<script lang="ts">
import { ElMessage } from 'element-plus';
import type { FriendLinkEntity } from '@blog/entities';
import { getResolveFriendLinkList } from '@blog/apis';
import { useAsyncData, useRouter } from '#app';
import { Token } from '~/feature/request/primary/token';

export default defineComponent({
  async setup() {
    const router = useRouter();
    const Data = {
      linkList: ref<FriendLinkEntity[]>([]),
      dialogVisible: ref(false),
    };
    const Methods = {
      async getData() {
        const { data } = await useAsyncData(() => getResolveFriendLinkList());
        Data.linkList.value = data.value?.data.list || [];
      },
      showLinkApplyDialog() {
        if (!Token.exists()) {
          router.push({
            path: '/user/login',
            query: { fromUrl: encodeURIComponent(router.currentRoute.value.fullPath) },
          });
          return;
        }
        Data.dialogVisible.value = true;
      },
      onSuccess() {
        ElMessage({ type: 'success', message: '添加成功，待博主核对后才会显示出来' });
      },
    };

    await Methods.getData();

    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.pg.friend-link {
  .board {
    li {
      display: inline-block;
      vertical-align: top;
      width: 220px;
      @media (max-width: 750px) {
        display: block;
        width: auto;
      }
    }
    .btn.apply {
      bottom: 100%;
      margin-bottom: 38px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--board-bg-color);
      color: var(--text-color);
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
  .tips {
    margin-top: 12px;
    font-size: 12px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }
  .title {
    font-size: 36px;
    text-align: center;
  }
}
</style>
