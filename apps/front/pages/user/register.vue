<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { register as registerApi } from '@blog/apis';
import type { RegisterDTO } from '@blog/dtos';
import { useRouter } from '#app';
import { Validator } from '~/types';

definePageMeta({
  layout: false,
});

const router = useRouter();
const form = reactive<RegisterDTO & { rePassword: string }>({
  username: '',
  password: '',
  nickname: '',
  rePassword: '',
  mobile: '',
  email: '',
});
const [loading, toggleLoading] = useToggleState(false);
const formRef = ref();
const rules = {
  username: { required: true, message: '用户名不能为空', trigger: ['blur'] },
  password: { required: true, message: '密码不能为空', trigger: ['blur'] },
  nickname: { required: true, message: '昵称不能为空', trigger: ['blur'] },
  rePassword: {
    required: true,
    trigger: ['blur', 'change'],
    validator: ((_, value, callback) => {
      if (form.password !== value) {
        callback(new Error('两次密码不一致'));
      } else {
        callback();
      }
    }) as Validator,
  },
  mobile: {
    required: false,
    trigger: ['blur'],
    validator: ((_, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      if (!/1[3-9]\d{9}/.test(value)) {
        callback(new Error('手机号码格式不正确'));
        return;
      }
      callback();
    }) as Validator,
  },
};

async function register() {
  await formRef.value.validate();
  toggleLoading();
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rePassword, mobile, ...rest } = form;
    await registerApi(rest);
    ElMessage({ type: 'success', message: '注册成功' });
    setTimeout(() => {
      router.push({
        path: '/user/login',
        query: { username: form.username, password: form.password },
      });
    }, 1000);
  } finally {
    setTimeout(toggleLoading, 200);
  }
}
</script>

<template>
  <Title>Nice's Blog - 注册</Title>
  <div class="pg register _ flex-col-c-c no-page-ani">
    <BgSvgMountain></BgSvgMountain>
    <div class="form-box page-ani-move">
      <h1>注册</h1>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" size="large" name="username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" size="large" name="nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" size="large" name="email"></el-input>
          接收博客推送
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" size="large" name="password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="重复密码" prop="rePassword">
          <el-input
            v-model="form.rePassword"
            size="large"
            name="rePassword"
            type="password"></el-input>
        </el-form-item>
        <el-form-item v-if="false" label="手机号码" prop="mobile">
          <el-input v-model="form.mobile" size="large"></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-block">
        <el-button type="primary" size="large" :loading="loading" @click="register">注册</el-button>
        <router-link to="/user/login">登录</router-link>
        <router-link to="/">首页</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.pg.register {
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
    padding-bottom: 2rem;
    box-sizing: border-box;
    border-radius: var(--board-radius);
    background: var(--navbar-bg-color);
    h1 {
      margin-bottom: 20px;
      font-size: 26px;
      font-weight: bold;
    }
    .el-input {
      background: none;
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
      bottom: -85%;
      background-color: rgba(69, 105, 144, 0.15);
      animation: wawes 6s infinite linear;
    }
    &::after {
      left: 35%;
      bottom: -85%;
      background-color: rgba(2, 128, 144, 0.2);
      animation: wawes 7s infinite;
    }
  }
  @media (max-width: 750px) {
    display: block;
    padding-top: 1rem;
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
      padding: 1rem 1rem 2rem;
      border-radius: 0;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      transform: none;
      transition: none;
      box-shadow: none;
      background-color: var(--navbar-bg-color);
      overflow-y: auto;
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
        position: fixed;
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
