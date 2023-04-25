<script setup lang="ts">
import { SwitchButton } from '@element-plus/icons-vue';
import useUserStore from '~/store/user.store';

const userStore = useUserStore();

const link = computed(() => '/user/info/' + userStore.user.id);
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">{{ userStore.user?.id ? '已登录' : '未登录' }}</h5>
    </template>
    <div class="widget-content">
      <template v-if="userStore.user?.id">
        <nuxt-link :to="link" class="_ flex-col-c">
          <el-avatar :src="userStore.user.avatar" size="large"></el-avatar>
          <div class="title _ ellipsis-2">{{ userStore.user.nickname }}</div>
        </nuxt-link>
        <div class="btns _ flex-c-c">
          <NuxtLink to="/article/create">
            <el-button class="post" type="primary" size="small">
              <i class="iconfont icon-edit"></i> 写文章
            </el-button>
          </NuxtLink>
          <ClientOnly>
            <el-popconfirm title="确认退出?" @confirm="userStore.logout">
              <template #reference>
                <el-button class="logout" type="warning" size="small">
                  <el-icon><SwitchButton /></el-icon> 登出
                </el-button>
              </template>
            </el-popconfirm>
          </ClientOnly>
        </div>
      </template>
      <template v-else>
        <div class="btns _ flex-c-c">
          <NuxtLink to="/user/register">
            <el-button class="post" type="primary" size="small">注册</el-button>
          </NuxtLink>
          <NuxtLink to="/user/login?fromUrl=%2F">
            <el-button class="login" type="primary" size="small">登录</el-button>
          </NuxtLink>
        </div>
      </template>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  .title {
    margin-top: 10px;
    color: var(--text-color);
    font-weight: bold;
  }
  .btns {
    margin-top: 10px;
    .logout,
    .login {
      margin-left: 10px;
    }
    i {
      margin-right: 3px;
      font-size: inherit;
    }
  }
}
</style>
