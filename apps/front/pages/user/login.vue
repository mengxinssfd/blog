<template>
  <div class="pg login _ flex-col-c-c no-page-ani">
    <Title>Nice's Blog - 登录</Title>
    <svg
      class="bg"
      xmlns="http://www.w3.org/2000/svg"
      style="background: linear-gradient(#135, #fbc, #135)">
      <filter id="filter">
        <feTurbulence type="fractalNoise" baseFrequency=".005 0" numOctaves="5" />
        <feDisplacementMap in="SourceAlpha" scale="99" />
        <feColorMatrix
          values="0 0 0 0 .01
                               0 0 0 0 .02
                               0 0 0 0 .02
                               0 0 0 -1 1" />
      </filter>
      <use href="#e" y="-100%" transform="scale(1 -1)" filter="blur(3px)" />
      <ellipse id="e" cx="50%" rx="63%" ry="43%" filter="url(#filter)" />
    </svg>
    <div class="form-box">
      <h1 class="title">Login</h1>
      <el-form v-model="form">
        <el-form-item>
          <el-input v-model="form.username" name="username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            name="password"
            type="password"
            placeholder="密码"></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-block">
        <el-button size="small" type="primary" @click="login">登录</el-button>
        <router-link to="/user/register">注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { login as loginReq } from '@blog/apis';
import type { LoginDTO } from '@blog/dtos';
import { useRoute } from '#app';

const route = useRoute();
const query = route.query;
if (query.username || query.password) {
  history.replaceState(null, document.title, '/user/login');
}
const form = reactive<LoginDTO>({
  username: (query.username as string) || '',
  password: (query.password as string) || '',
});
async function login() {
  await loginReq(form);
  const fromUrl = query.fromUrl as string;
  location.href = fromUrl ? decodeURIComponent(fromUrl) : '/';
}
</script>
<style lang="scss">
.pg.login {
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
  }
  .form-box {
    position: relative;
    box-sizing: border-box;
    padding: 30px;
    width: 380px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.85);
    h1 {
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
    }
    .btn-block {
      text-align: right;
      a {
        margin-left: 10px;
        font-size: 14px;
      }
    }
  }
  .el-form {
  }
  .form-box {
    overflow: hidden;
    padding: 40px 30px 30px 30px;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    transform: translate(-50%, -50%);
    transition: transform 300ms, box-shadow 300ms;
    box-shadow: 5px 10px 10px rgba(2, 128, 144, 0.2);
    &::before,
    &::after {
      // https://codepen.io/davinci/details/YxwwWd
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-top-left-radius: 40%;
      border-top-right-radius: 45%;
      border-bottom-left-radius: 35%;
      border-bottom-right-radius: 40%;
      z-index: -1;
    }
    &::before {
      left: 40%;
      bottom: -130%;
      background-color: rgba(69, 105, 144, 0.15);
      animation: wawes 6s infinite linear;
    }
    &::after {
      left: 35%;
      bottom: -125%;
      background-color: rgba(2, 128, 144, 0.2);
      animation: wawes 7s infinite;
    }
  }
  @keyframes wawes {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
