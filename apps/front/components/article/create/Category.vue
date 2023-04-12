<template>
  <div class="c-create-cate">
    <el-dialog v-model="show">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名:" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="描述:" prop="description">
          <el-input v-model="form.description" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-block">
        <el-button type="primary" @click="submit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<!--<script lang="ts" setup>
import {reactive, watch, withDefaults, ref, toRefs, Ref} from 'vue';
import { createCategory } from '../../../../api/category';
import { ElMessage } from 'element-plus';

interface Props {
  visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
});
const emits = defineEmits(['createSuccess', 'update:visible']);
const data = reactive({
  form: {
    name: '',
    description: '',
  },
});
const propsRefs = toRefs(props);
const show = ref(false);
const rules = {
  name: { required: true, message: '标签名不能为空' },
};
watch(
  propsRefs.visible,
  (n) => {
    show.value = n;
  },
  { immediate: true },
);
watch(show, () => {
  emits('update:visible', show.value);
});
const formRef = ref();
async function submit() {
  try {
    await formRef.value.validate();
    const res = await createCategory(data.form);
    if (res.code === 200) {
      show.value = false;
      emits('createSuccess');
      ElMessage({ type: 'success', message: res.msg });
      return;
    }
  } catch (e) {
    console.log(e);
  }
}
</script>-->

<script lang="ts">
import * as Vue from 'vue';
import { ElMessage } from 'element-plus';
import type { CheckDuplicateKey } from '@tool-pack/types';
import { createCategory } from '@blog/apis';

enum Emits {
  updateVisible = 'update:visible',
  createSuccess = 'createSuccess',
}

export default defineComponent({
  props: {
    visible: {
      type: Boolean as Vue.PropType<boolean>,
      default: false,
    },
  },
  emits: [Emits.updateVisible, Emits.createSuccess],
  setup(props, { emit }) {
    const Data = {
      formRef: ref(),
      form: reactive({
        name: '',
        description: '',
      }),
      rules: {
        name: { required: true, message: '标签名不能为空' },
      },
    };
    const Computed = {
      show: computed({
        get: () => props.visible,
        set(value: boolean) {
          emit(Emits.updateVisible, value);
        },
      }),
    };
    const Methods = {
      async submit() {
        try {
          await Data.formRef.value.validate();
          const res = await createCategory(Data.form);
          if (res.code === 201) {
            Computed.show.value = false;
            emit(Emits.createSuccess);
            ElMessage({ type: 'success', message: res.msg });
            return;
          }
        } catch (e) {
          console.log(e);
        }
      },
    };

    // CheckDuplicateKey检测是否有重复的key
    const res: CheckDuplicateKey<typeof Data, typeof Computed, typeof Methods> = {
      ...Data,
      ...Computed,
      ...Methods,
    };
    // webstorm打开的vue template不认MergeNoDuplicateKeyObj
    return res as typeof Data & typeof Computed & typeof Methods;
  },
});
</script>
