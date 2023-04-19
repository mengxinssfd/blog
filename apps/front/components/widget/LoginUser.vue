<script setup lang="ts">
import useUserStore from '~/store/user.store';

const userStore = useUserStore();

const link = computed(() => '/user/info/' + userStore.user.id);
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title"></h5>
    </template>
    <div class="widget-content">
      <template v-if="userStore.user?.id">
        <nuxt-link :to="link" class="_ flex-col-c" external>
          <el-avatar :src="userStore.user.avatar" size="large"></el-avatar>
          <div class="title _ ellipsis-2">{{ userStore.user.nickname }}</div>
        </nuxt-link>
        <div class="btns _ flex-c-c">
          <NuxtLink to="/article/create">
            <el-button class="post" type="primary" size="small">
              发布 <i class="iconfont icon-edit"></i>
            </el-button>
          </NuxtLink>
          <el-button class="logout" type="warning" size="small" @click="userStore.logout">
            登出
          </el-button>
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
      margin-left: 2px;
    }
  }
}
</style>
