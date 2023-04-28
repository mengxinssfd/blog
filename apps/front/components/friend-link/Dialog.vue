<!--友链新增/编辑弹窗 FriendLinkDialog.vue-->
<template>
  <ClientOnly>
    <el-dialog v-model="visible" class="edit-user-info-dialog" title="添加">
      <el-form
        ref="elFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        @submit.stop.prevent
        @keydown.enter="submit">
        <el-form-item label="网站链接" prop="link">
          <el-input v-model="form.link"></el-input>
          <div>会自动从链接获取网站信息</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" plain @click="hideDialog">取消</el-button>
        <el-button v-loading="loading" type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { createFriendLink } from '@blog/apis';
import type { CreateFriendLinkDto } from '@blog/dtos';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:show', 'success']);

const createFormValue = (): CreateFriendLinkDto => ({ link: '' });

const elFormRef = ref();
const visible = computed({
  set: (value: boolean) => emits('update:show', value),
  get: () => props.show,
});
const form = ref<CreateFriendLinkDto>(createFormValue());
const rules = { link: { required: true, message: '链接不能为空' } };
const loading = ref(false);

function hideDialog() {
  visible.value = false;
}
async function submit() {
  try {
    loading.value = true;
    await elFormRef.value.validate();
    await createFriendLink(form.value);
    hideDialog();
    emits('success');
  } finally {
    loading.value = false;
  }
}
</script>
