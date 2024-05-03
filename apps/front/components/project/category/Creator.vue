<script lang="ts" setup>
import * as Vue from 'vue';
import { updateObj } from '@tool-pack/basic';
import type { ProjectCategoryEntity } from '@blog/entities';
import { createProjectCategory, updateProjectCategory } from '@blog/apis';
import type { CreateProjectCategoryDto } from '@blog/dtos';

defineOptions({ name: 'ProjectCategoryCreator' });

const visible = defineModel<boolean>({ type: Boolean, default: false });
const props = defineProps({
  data: {
    type: Object as Vue.PropType<ProjectCategoryEntity | null>,
    default: () => null,
  },
});

const emits = defineEmits(['success']);

const createFormValue = (): CreateProjectCategoryDto => ({
  name: '',
  desc: '',
  weights: 0,
});

const elFormRef = ref();

const form = ref<CreateProjectCategoryDto>(createFormValue());
const rules = {
  name: { required: true, message: '名称不能为空' },
  // link: { required: true, message: '项目链接不能为空' },
  desc: { required: false },
};
const loading = ref(false);

watch(visible, (n) => {
  if (!n) {
    if (props.data) form.value = createFormValue();
    return;
  }
  if (props.data) updateObj(form.value, createFormValue(), props.data);
  elFormRef.value?.clearValidate();
});

function hideDialog() {
  visible.value = false;
}
async function submit() {
  try {
    loading.value = true;
    await elFormRef.value.validate();
    if (props.data) {
      await updateProjectCategory(props.data.id, form.value);
    } else {
      await createProjectCategory(form.value);
    }
    hideDialog();
    emits('success');
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <ClientOnly>
    <el-dialog
      v-model="visible"
      :title="(data ? '编辑' : '新增') + '项目分类'"
      :close-on-click-modal="false">
      <el-form ref="elFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" rows="5" />
        </el-form-item>
        <el-form-item label="权重" prop="weights">
          <el-input-number v-model="form.weights" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" plain @click="hideDialog">取消</el-button>
        <el-button v-loading="loading" type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </ClientOnly>
</template>
