<script lang="ts" setup>
import * as Vue from 'vue';
import { getStartOfDate, updateObj } from '@tool-pack/basic';
import type { ProjectEntity } from '@blog/entities';
import { PROJECT_STATUS } from '@blog/entities/constant';
import { createProject, getProjectCategoryList, updateProject } from '@blog/apis';
import type { CreateProjectDto } from '@blog/dtos';
import { useRequest } from '@request-template/vue3-hooks';

const visible = defineModel<boolean>('show', { type: Boolean, default: false });
const props = defineProps({
  data: {
    type: Object as Vue.PropType<ProjectEntity | null>,
    default: () => null,
  },
});

const emits = defineEmits(['update:show', 'success']);

const createFormValue = (): CreateProjectDto => ({
  name: '',
  desc: '',
  link: '',
  cover: '',
  techStack: '',
  transferredTo: '',
  weights: 0,
  status: PROJECT_STATUS.Developing,
  startTime: getStartOfDate(new Date()),
  endTime: null,
  categoryId: undefined,
});

const elFormRef = ref();

const form = ref<CreateProjectDto>(createFormValue());
const rules = {
  name: { required: true, message: '项目名称不能为空' },
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

const { data: category, request: getCategories } = useRequest(() =>
  getProjectCategoryList({ pure: true }),
);
const categories = computed(() => category.value?.list || []);

const unwatch = watch(visible, (n) => {
  if (!n) return;
  getCategories();
  unwatch();
});

function hideDialog() {
  visible.value = false;
}
async function submit() {
  try {
    loading.value = true;
    await elFormRef.value.validate();
    if (props.data) {
      await updateProject(props.data.id, form.value);
    } else {
      await createProject(form.value);
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
      class="edit-user-info-dialog"
      :title="data ? '编辑' : '新增'"
      :close-on-click-modal="false">
      <el-form ref="elFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId">
            <el-option
              v-for="cate in categories"
              :key="cate.id"
              :value="cate.id"
              :label="cate.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目封面" prop="cover">
          <el-input v-model="form.cover" />
          <img v-if="form.cover" class="avatar-view" :src="form.cover" alt="" />
        </el-form-item>
        <el-form-item label="项目描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" rows="5" />
        </el-form-item>
        <el-form-item label="项目链接" prop="link">
          <el-input v-model="form.link" />
        </el-form-item>

        <el-form-item label="转移到" prop="transferredTo">
          <el-input v-model="form.transferredTo" />
        </el-form-item>
        <el-form-item label="技术栈" prop="techStack">
          <el-input v-model="form.techStack" />
        </el-form-item>
        <el-form-item label="权重" prop="weights">
          <el-input-number v-model="form.weights" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio-button :label="PROJECT_STATUS.Developing">
              {{ PROJECT_STATUS[PROJECT_STATUS.Developing] }}
            </el-radio-button>
            <el-radio-button :label="PROJECT_STATUS.Transferred">
              {{ PROJECT_STATUS[PROJECT_STATUS.Transferred] }}
            </el-radio-button>
            <el-radio-button :label="PROJECT_STATUS.Completed">
              {{ PROJECT_STATUS[PROJECT_STATUS.Completed] }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="时间">
          <el-col :span="11">
            <el-date-picker v-model="form.startTime" type="datetime" style="width: 100%" />
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <el-col :span="11">
            <el-date-picker v-model="form.endTime" type="datetime" style="width: 100%" />
          </el-col>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" plain @click="hideDialog">取消</el-button>
        <el-button v-loading="loading" type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </ClientOnly>
</template>
