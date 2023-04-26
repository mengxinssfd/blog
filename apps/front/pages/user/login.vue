<script setup lang="ts">
import { login as loginReq } from '@blog/apis';
import type { LoginDTO } from '@blog/dtos';
import { useRoute } from '#app';

definePageMeta({
  layout: false,
});
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

<template>
  <Title>Nice's Blog - 登录</Title>
  <div class="pg login _ flex-col-c-c no-page-ani">
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
      <h1 class="title">登录</h1>
      <el-form v-model="form" @keydown.enter="login">
        <el-form-item>
          <el-input
            v-model="form.username"
            size="large"
            name="username"
            placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            name="password"
            type="password"
            size="large"
            placeholder="密码"></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-block">
        <el-button size="large" type="primary" @click="login">登录</el-button>
        <router-link to="/user/register">注册</router-link>
        <router-link to="/">首页</router-link>
      </div>
    </div>
  </div>
</template>

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
    border-radius: var(--board-radius);
    background: var(--navbar-bg-color);
    h1 {
      margin-bottom: 20px;
      font-size: 26px;
      font-weight: bold;
    }
    .btn-block {
      text-align: right;
      a {
        margin-left: 10px;
        font-size: 14px;
      }
    }
  }
  .form-box {
    overflow: hidden;
    padding: 3.8rem 3rem;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 500px;
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
  @media (max-width: 750px) {
    display: block;
    &:after {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--navbar-bg-color);
      backdrop-filter: saturate(5) blur(3px);
      content: '';
    }

    .form-box {
      position: absolute;
      z-index: 5;
      padding: 2rem 1rem 1rem;
      border-radius: 0;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      transform: none;
      transition: none;
      box-shadow: none;
      background-color: var(--navbar-bg-color);
      h1 {
        padding-top: 2rem;
        text-align: center;
      }

      .el-form-item {
        display: block;
      }
      .btn-block {
        > * {
          display: block;
          width: 100%;
          margin: 1rem 0 0 !important;
          text-align: center;
        }
      }
      &:before,
      &:after {
        bottom: -300px;
      }
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
