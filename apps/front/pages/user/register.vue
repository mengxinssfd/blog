<template>
  <div class="pg register _ flex-col-c-c no-page-ani">
    <Title>Nice's Blog - 注册</Title>
    <BgSvgMountain></BgSvgMountain>
    <div class="form-box page-ani-move">
      <h1>注册</h1>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" name="username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" name="nickname"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" name="password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="重复密码" prop="rePassword">
          <el-input v-model="form.rePassword" name="rePassword" type="password"></el-input>
        </el-form-item>
        <el-form-item v-if="false" label="手机号码" prop="mobile">
          <el-input v-model="form.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-block">
        <el-button type="primary" :loading="loading" @click="register">注册</el-button>
        <router-link to="/user/login">登录</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage } from 'element-plus';
import { register } from '@blog/apis';
import type { RegisterDTO } from '@blog/dtos';
import { useRouter } from '#app';
import { useToggleState } from '~/feature/hooks';

type Validator = (_: unknown, value: string, callback: Function) => void;

export default defineComponent({
  setup() {
    const router = useRouter();
    const form = reactive<RegisterDTO & { rePassword: string }>({
      username: '',
      password: '',
      nickname: '',
      rePassword: '',
      mobile: '',
    });
    const [loading, toggleLoading] = useToggleState(false);
    const Data = {
      loading,
      form,
      formRef: ref(),
      rules: {
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
      },
    };
    return {
      ...Data,
      async register() {
        await Data.formRef.value.validate();
        toggleLoading();
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { rePassword, mobile, ...rest } = form;
          await register(rest);
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
      },
    };
  },
});
</script>
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
