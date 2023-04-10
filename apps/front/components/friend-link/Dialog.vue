<!--友链新增/编辑弹窗 FriendLinkDialog.vue-->
<template>
  <el-dialog v-model="visible" class="edit-user-info-dialog" :title="data ? '编辑' : '新增'">
    <el-form ref="elFormRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="网站名" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="form.avatar"></el-input>
        <img v-if="form.avatar" class="avatar-view" :src="form.avatar" alt="" />
      </el-form-item>
      <el-form-item label="网站描述" prop="desc">
        <el-input v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item label="网站链接" prop="link">
        <el-input v-model="form.link"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" plain @click="hideDialog">取消</el-button>
      <el-button v-loading="loading" type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as Vue from 'vue';
import { objUpdate } from '@mxssfd/ts-utils';
import type { FriendLinkEntity } from '@blog/entities';
import { createFriendLink, updateFriendLink } from '@blog/apis';
import { CreateFriendLinkDto } from '@blog/dtos';

type Form = Pick<FriendLinkEntity, 'name' | 'desc' | 'link' | 'avatar'>;

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as Vue.PropType<FriendLinkEntity | null>,
    default: () => null,
  },
});

const emits = defineEmits(['update:show', 'success']);

const createFormValue = (): Form => ({ name: '', desc: '', link: '', avatar: '' });

const elFormRef = ref();
const visible = computed({
  set: (value: boolean) => emits('update:show', value),
  get: () => props.show,
});
const form = ref<CreateFriendLinkDto>(createFormValue());
const rules = {
  name: { required: true, message: '网站名不能为空' },
  link: { required: true, message: '链接不能为空' },
  desc: { required: false },
};
const loading = ref(false);

watch(
  toRefs(props).data,
  (n) => {
    if (n) objUpdate(form.value, createFormValue(), n);
  },
  { immediate: true },
);

function hideDialog() {
  visible.value = false;
}
async function submit() {
  try {
    loading.value = true;
    await elFormRef.value.validate();
    if (props.data) {
      await updateFriendLink(props.data.id, form.value);
    } else {
      await createFriendLink(form.value);
    }
    hideDialog();
    emits('success');
  } finally {
    loading.value = false;
  }
}
</script>
