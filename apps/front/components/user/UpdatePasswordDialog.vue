<template>
  <el-dialog v-model="visible" class="edit-password-dialog" title="修改密码" append-to-body>
    <el-form ref="formRef" :model="form.model" :rules="form.rules" label-width="80px">
      <el-form-item label="当前密码" prop="curPassword">
        <el-input v-model="form.model.curPassword" type="password"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="form.model.password" type="password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="rePassword">
        <el-input v-model="form.model.rePassword" type="password"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" plain @click="visible = false">取消</el-button>
      <el-button v-loading="form.loading" type="primary" @click="editPassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as Vue from 'vue';
import type { UserEntity } from '@blog/entities';
import { updatePassword } from '@blog/apis';
import type { UpdatePasswordDto } from '@blog/dtos';
import type { Validator } from '~/types';

const emit = defineEmits(['update:show', 'updated']);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object as Vue.PropType<UserEntity>,
    require: true,
    default: () => ({}),
  },
});

const formRef = ref();
const form = reactive({
  model: {
    curPassword: '',
    password: '',
    rePassword: '',
  } satisfies UpdatePasswordDto & { rePassword: string },
  rules: {
    curPassword: { required: true, message: '当前密码不能为空' },
    password: { required: true, message: '密码不能为空' },
    rePassword: {
      required: true,
      trigger: ['blur', 'change'],
      validator: ((_, value, callback) => {
        if (form.model.password !== value) {
          callback(new Error('两次密码不一致'));
        } else {
          callback();
        }
      }) as Validator,
    },
  },
  loading: false,
});
const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
});

async function editPassword() {
  try {
    form.loading = true;
    await formRef.value.validate();
    await updatePassword(props.user.id, form.model);
    visible.value = false;
    emit('updated');
  } catch (e) {
    console.log(e);
  } finally {
    form.loading = false;
  }
}
</script>
<style lang="scss">
.edit-password-dialog {
  margin-top: 15vh !important;
  min-width: 375px;
}
</style>
