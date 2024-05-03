<script setup lang="ts">
import * as Vue from 'vue';
import type { CreateSaysDto } from '@blog/dtos';
import type { SaysEntity } from '@blog/entities';
import { SAYS_VISIBLE_STATUS } from '@blog/entities/constant';
import { createSays, updateSays } from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { updateObj } from '@tool-pack/basic';
import MdEditorAsync from '~/components/MdEditorAsync.vue';

const model = defineModel<boolean>({ type: Boolean, default: false });
const emit = defineEmits(['success']);
const props = defineProps({
  data: {
    type: Object as Vue.PropType<Partial<SaysEntity>>,
    default: null,
  },
});

const saysCache = useStorageItem<CreateSaysDto>('saysCache', process.client ? localStorage : null);

watch(model, (n) => {
  if (!n) return;
  if (props.data) {
    updateObj(form.value, props.data, {
      expires: props.data.expires ? new Date(props.data.expires) : undefined,
    });
  } else {
    form.value = saysCache.get(createFormData());
  }
  formRef.value?.clearValidate();
});

const month3 = new Date();
month3.setMonth(month3.getMonth() + 3);
const createFormData = () =>
  ({
    expires: month3,
    content: '',
    visible: SAYS_VISIBLE_STATUS.Public,
  } as CreateSaysDto);

const form = ref(createFormData());
const formRef = ref();

watch(
  form,
  (n) => {
    saysCache.set(n);
  },
  { deep: true },
);

const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '3天后',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return date;
    },
  },
  {
    text: '1周后',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
  {
    text: '1月后',
    value: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  },
  {
    text: '3月后',
    value: () => month3,
  },
];

const { loading, request } = useRequest(
  () => (props.data?.id ? updateSays(props.data.id, form.value) : createSays(form.value)),
  { loading: { threshold: 500 } },
);

const confirm = async () => {
  await formRef.value?.validate();
  await request();
  model.value = false;
  emit('success');

  saysCache.remove();
};
</script>

<template>
  <ClientOnly>
    <el-dialog v-model="model" append-to-body :title="data ? '编辑' : '新增'">
      <el-form ref="formRef" v-loading="loading" :model="form" label-width="70">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.visible">
            <el-radio-button :label="SAYS_VISIBLE_STATUS.Public">
              {{ SAYS_VISIBLE_STATUS[SAYS_VISIBLE_STATUS.Public] }}
            </el-radio-button>
            <el-radio-button :label="SAYS_VISIBLE_STATUS.Login">
              {{ SAYS_VISIBLE_STATUS[SAYS_VISIBLE_STATUS.Login] }}
            </el-radio-button>
            <el-radio-button :label="SAYS_VISIBLE_STATUS.Private">
              {{ SAYS_VISIBLE_STATUS[SAYS_VISIBLE_STATUS.Private] }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="过期时间" prop="expires">
          <el-date-picker v-model="form.expires" type="datetime" :shortcuts="shortcuts" />
        </el-form-item>
        <el-form-item label="内容" prop="content" required>
          <MdEditorAsync v-model="form.content" height="350px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="model = false">取消</el-button>
        <el-button v-loading="loading" type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </ClientOnly>
</template>

<style lang="scss"></style>
