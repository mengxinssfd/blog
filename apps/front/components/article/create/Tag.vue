<template>
  <div class="c-create-cate">
    <el-dialog v-model="show">
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="80px">
        <el-form-item label="标签名:" prop="name">
          <el-input v-model="data.form.name"></el-input>
        </el-form-item>
        <el-form-item label="描述:" prop="description">
          <el-input v-model="data.form.description" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-block">
        <el-button type="primary" @click="submit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { createTag } from '@blog/apis';

// interface Props {
//   visible: boolean;
// }

// const props = withDefaults(defineProps<Props>(), {
//   visible: false,
// });
// 跟上面区别不大
const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});
enum EmitEnum {
  updateVisible = 'update:visible',
  createSuccess = 'createSuccess',
}

// defineEmits用enum做emit会报错 很奇怪
// const emits = defineEmits([EmitEnum.updateVisible, EmitEnum.createSuccess]);

const emits = defineEmits(['update:visible', 'createSuccess']);
const data = reactive({
  form: {
    name: '',
    description: '',
  },
});

const show = computed({
  get: () => props.visible,
  set: (value: boolean) => emits(EmitEnum.updateVisible, value),
});

// setup script必须用defineExpose才能this.$refs.xxx.show，否则整个ref都是空的
// defineExpose({show});

const rules = {
  name: { required: true, message: '标签名不能为空' },
};
const formRef = ref();

async function submit() {
  try {
    await formRef.value.validate();
    const res = await createTag(data.form);
    if (res.code === 201) {
      show.value = false;
      emits(EmitEnum.createSuccess);
      ElMessage({ type: 'success', message: res.msg });
      return;
    }
  } catch (e) {
    console.log(e);
  }
}
</script>
