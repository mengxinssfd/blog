<script lang="ts" setup>
import type { RecordDialogFormInterface } from './dialog-form-interface';

const model = defineModel({ type: Boolean, default: false });
const emits = defineEmits(['confirm']);
const tempFormSI = useStorageItem<RecordDialogFormInterface>(
  'tempRecordSave',
  process.client ? localStorage : null,
);

const createFormValue = (): RecordDialogFormInterface => {
  const s = process.client ? window.screen : { width: 0, height: 0 };
  return {
    width: s.width,
    height: s.height,
    audio: true,
    microphone: true,
    frameRate: 60,
    codec: 'default',
  };
};
const codecs: ReturnType<typeof getCodecs> = [{ label: 'default', value: 'default' }].concat(
  process.client ? getCodecs() : [],
);

const elFormRef = ref();
const form = ref<RecordDialogFormInterface>(tempFormSI.get() || createFormValue());
const rules: Partial<Record<keyof RecordDialogFormInterface, any>> = {
  width: { required: true, message: '宽度不能为空' },
  height: { required: true, message: '高度不能为空' },
  frameRate: { required: true, message: '帧率不能为空' },
};

function hideDialog() {
  model.value = false;
}
async function submit() {
  try {
    await elFormRef.value.validate();
    hideDialog();
    tempFormSI.set(form.value);
    emits('confirm', form.value);
  } catch {}
}
function getCodecs(): { label: string; value: string }[] {
  if (!supportsSetCodecPreferences()) return [];

  const capabilities = RTCRtpSender.getCapabilities('video');
  if (!capabilities) return [];

  const { codecs } = capabilities;
  const filters = ['video/red', 'video/ulpfec', 'video/rtx'];
  return codecs
    .filter((codec) => !filters.includes(codec.mimeType))
    .reduce((prev, cur) => {
      prev.push({
        label: (cur.mimeType + ' ' + (cur.sdpFmtpLine || '')).trim(),
        value: cur.mimeType,
      });
      return prev;
    }, [] as ReturnType<typeof getCodecs>);
}
function supportsSetCodecPreferences(): boolean {
  return Boolean(
    process.client &&
      window.RTCRtpTransceiver &&
      'setCodecPreferences' in window.RTCRtpTransceiver.prototype,
  );
}
</script>
<template>
  <ClientOnly>
    <el-dialog v-model="model" class="edit-user-info-dialog" title="设置">
      <el-form
        ref="elFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        @submit.stop.prevent
        @keydown.enter="submit">
        <el-form-item label="视频宽度" prop="width">
          <el-input-number v-model="form.width" :min="1" />
        </el-form-item>
        <el-form-item label="视频高度" prop="height">
          <el-input-number v-model="form.height" :min="1" />
        </el-form-item>
        <el-form-item label="视频帧率" prop="frameRate">
          <el-input-number v-model="form.frameRate" :min="1" />
        </el-form-item>
        <el-form-item v-if="false" label="视频格式" prop="codec">
          <el-select v-model="form.codec">
            <el-option v-for="opt in codecs" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="音频" prop="audio">
          <el-checkbox v-model="form.audio" />
        </el-form-item>
        <el-form-item label="麦克风" prop="microphone">
          <el-checkbox v-model="form.microphone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" plain @click="hideDialog">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </ClientOnly>
</template>
