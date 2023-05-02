<script setup lang="ts">
import { PROJECT_NAME } from '~/config/constants';

const route = useRoute();
const link = (route.query.target as string) || '';
const deLink = link ? decodeURIComponent(link) : link;
</script>
<template>
  <div class="pg link _ flex-col-c-c fixed">
    <Title>Nice's Blog - 跳转链接</Title>
    <div class="link-box _ pos-trans-c-c fixed">
      <h1 class="_ abs-tl"><img class="logo" src="/favicon.ico" alt="" />{{ PROJECT_NAME }}</h1>
      <div class="tips">即将离开，请注意账号财产安全</div>
      <div class="link">{{ deLink }}</div>
      <a class="_ abs-br" :href="link" rel="noreferrer noopener nofollow">
        <el-button type="primary" size="small">继续访问</el-button>
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.pg.link {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  @media (max-width: 1920px) {
    background: url('https://img.zcool.cn/community/0155995d369d7fa8012187f410de33.jpg@3000w_1l_0o_100sh.jpg')
      no-repeat;
    background-size: cover;
  }
  .link-box {
    padding: 60px 20px 80px;
    width: 50%;
    max-width: 600px;
    border-radius: var(--board-radius);
    box-shadow: var(--board-shadow);
    background: var(--board-bg-color);
    color: var(--text-color);
    word-break: break-all;
    .link {
      margin-top: 10px;
      color: var(--sec-text-color);
    }
    .logo {
      margin-right: 10px;
      width: 20px;
    }
    h1,
    .el-button {
      margin: 20px;
    }
  }
}
</style>
