<script setup lang="ts">
import { SwitchButton } from '@element-plus/icons-vue';
import useUserStore from '~/store/user.store';

const userStore = useUserStore();
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">{{ userStore.user?.id ? '已登录' : '未登录' }}</h5>
    </template>
    <div class="widget-content">
      <template v-if="userStore.user?.id">
        <div class="_ flex-col-c">
          <Avatar :user="userStore.user" />
          <div class="nickname _ ellipsis-2">{{ userStore.user.nickname }}</div>
        </div>
        <div class="btns _ flex-c-c">
          <NuxtLink to="/article/create">
            <el-button class="post" type="primary">
              <i class="iconfont icon-edit"></i> 写文章
            </el-button>
          </NuxtLink>
          <ClientOnly>
            <el-popconfirm title="确认退出?" @confirm="userStore.logout">
              <template #reference>
                <el-button class="logout" type="warning">
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
            <el-button class="post" type="primary">注册</el-button>
          </NuxtLink>
          <NuxtLink to="/user/login?fromUrl=%2F">
            <el-button class="login" type="primary">登录</el-button>
          </NuxtLink>
        </div>
      </template>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  .nickname {
    margin: 10px 0;
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
