<template>
  <el-dialog v-model="visible" class="edit-user-info-dialog" title="编辑" append-to-body>
    <el-form ref="formRef" :model="form.model" :rules="form.rules" label-width="80px">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.model.nickname"></el-input>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="form.model.avatar"></el-input>
        <img v-if="form.model.avatar" class="avatar-view" :src="form.model.avatar" alt="" />
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="form.model.mobile"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.model.email"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" plain @click="visible = false">取消</el-button>
      <el-button v-loading="form.loading" type="primary" @click="editUserInfo"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as Vue from 'vue';
import { updateObj } from '@tool-pack/basic';
import { updateUserInfo, updateUserInfoByAdmin } from '@blog/apis';
import type { UserEntity } from '@blog/entities';
import { Validator } from '~/types';

const emit = defineEmits(['updated', 'update:show']);

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
  byAdmin: {
    type: Boolean,
    default: false,
  },
});

const formRef = ref();
const form = reactive({
  model: {
    nickname: '',
    mobile: '',
    email: '',
    avatar: '',
  },
  rules: {
    nickname: { required: true, message: '昵称不能为空' },
    avatar: { required: true, message: '头像不能为空' },
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
  loading: false,
});
const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
});
watch(visible, (n) => {
  n && updateObj(form.model, props.user as any);
});
const editUserInfo = async () => {
  try {
    form.loading = true;
    await formRef.value.validate();
    await (props.byAdmin ? updateUserInfoByAdmin : updateUserInfo)(props.user?.id, {
      ...form.model,
    });
    emit('updated');
    visible.value = false;
  } catch (e) {
    console.log(e);
  } finally {
    form.loading = false;
  }
};
</script>
<style lang="scss">
.edit-user-info-dialog {
  margin-top: 15vh !important;
  min-width: 375px;
  .avatar-view {
    margin-top: 10px;
    width: 60px;
  }
}
</style>
