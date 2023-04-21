<script setup lang="ts">
import { uploadUrl } from '@blog/apis';
import { ElMessage } from 'element-plus';
import { Clipboard as ClipboardKit } from '@tool-pack/bom';
import type { ResType } from 'request-template';
import { HttpStatus } from 'request-template';
import { Token } from '~/feature/request/primary/token';

const fileList = ref<{ name: string; url: string }[]>([]);
const uploadOpt = {
  action: import.meta.env.VITE_BASE_URL + uploadUrl,
  headers: {
    authorization: `Bearer ${Token.get()}`,
  },
  'on-error'(res: ResType<string> | Error) {
    if (res instanceof Error) {
      ElMessage.error(res.message);
      return;
    }
    ElMessage.error(res.msg);
  },
  'on-success'(res: ResType<string>, file: { name: string }) {
    if (![HttpStatus.CREATED, HttpStatus.OK].includes(res.code)) {
      uploadOpt['on-error'](res);
      return;
    }
    const find = fileList.value.find((i) => i.name === file.name);
    if (!find) return;
    find.url = res.data;
  },
  'on-change'(file: any, _fileList: any) {
    file.status === 'ready' && (fileList.value = _fileList.slice());
  },
  'on-preview'({ url }: { url: string }) {
    if (!url) {
      ElMessage.error('链接为空');
      return;
    }
    ClipboardKit.copy(url).then(() =>
      ElMessage({ type: 'success', message: '链接已复制到剪贴板' }),
    );
  },
  data: reactive({
    timeStampName: 0,
  }),
};
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">文件上传</h5>
    </template>
    <div class="widget-content">
      <div class="upload">
        以时间戳为文件名
        <el-switch
          v-model="uploadOpt.data.timeStampName"
          :inactive-value="0"
          :active-value="1"></el-switch>
        <el-upload class="upload-demo" v-bind="uploadOpt" :file-list="fileList" drag>
          <div class="el-upload__text _ h-p100 flex-c-c">
            Drop file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
          </template>
        </el-upload>
      </div>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  font-size: 13px;
}
</style>
