<script setup lang="ts">
import { download, recordMedia } from '@tool-pack/dom';
import { formatMilliseconds } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import type { ArticleEntity } from '@blog/entities';

const chunksRef = ref<Blob[]>([]);
const urlsRef = ref<string[]>([]);
const mediaRef = ref<MediaStream | null>(null);
const recorderRef = ref<MediaRecorder | null>(null);
const state = reactive({
  sharing: false,
  recording: false,
  recordAt: null as null | number,
  recordingTime: 0,
  recordTimer: null as null | ReturnType<typeof setInterval>,
});
const articleAs = ref<ArticleEntity>();

watch(
  () => state.recordAt,
  (n) => {
    if (n === null) {
      state.recordTimer !== null && clearInterval(state.recordTimer);
      state.recordTimer = null;
      return;
    }
    state.recordTimer = setInterval(() => {
      state.recordingTime = Date.now() - n;
    }, 1000);
  },
);

onBeforeRouteLeave(() => {
  onStopShare();
});

async function onStartShare() {
  mediaRef.value = await queryMedia();
  state.sharing = true;
}
function onStartRecord() {
  record();
  state.recording = true;
  state.recordingTime = 0;
  state.recordAt = Date.now();
}
function onStopRecord() {
  if (!recorderRef.value) return;
  recorderRef.value.stop();
  state.recording = false;
  state.recordingTime = 0;
  state.recordAt = null;
}
function onStopShare() {
  const media = mediaRef.value;
  if (!media) return;
  media.getTracks().forEach((t) => t.stop());
  state.sharing = false;
}
function onDelItem(index: number) {
  chunksRef.value.splice(index, 1);
  urlsRef.value.splice(index, 1);
}
async function onDownloadItem(index: number) {
  try {
    const { value } = await ElMessageBox.prompt('输入文件名', 'Tip', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: 'record',
    });
    downloadVideo(value, chunksRef.value[index]);
  } catch {}
}
async function onDownloadAll() {
  try {
    const { value } = await ElMessageBox.prompt('输入文件名', 'Tip', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: 'record',
    });
    if (chunksRef.value.length === 1) {
      downloadVideo(value, chunksRef.value[0]);
      return;
    }
    chunksRef.value.forEach((chunk, index) => downloadVideo(`${value}_${index + 1}`, chunk));
  } catch {}
}
function onClearAll() {
  chunksRef.value.length = 0;
  urlsRef.value.length = 0;
}

function queryMedia(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: {
      width: window.screen.width,
      height: window.screen.height,
      // frameRate: {
      //   ideal: 100,
      //   max: 160,
      // },
    },
  });
}

function record() {
  if (!mediaRef.value) return;
  [recorderRef.value] = recordMedia(mediaRef.value, (chunk) => {
    chunksRef.value.push(chunk);
    urlsRef.value.push(URL.createObjectURL(blobToWEBM(chunk)));
  });
  recorderRef.value.onstop = onStopRecord;
  recorderRef.value.start();
}
function blobToWEBM(blob: Blob): Blob {
  return new Blob([blob], { type: 'video/webm' });
}
function downloadVideo(filename = 'record', blob: Blob): void {
  download(filename.trim() + '.webm', blobToWEBM(blob));
}
</script>

<template>
  <ArticleAsPage as="tools/rtc" @data="articleAs = $event">
    <template #aside>
      <Widget class="record-widget">
        <div
          v-if="articleAs?.content"
          class="record-widget-content"
          v-html="articleAs.content"></div>
        <div v-else class="rules">
          <el-skeleton :rows="6" animated />
        </div>
      </Widget>
    </template>
    <section class="tools-record board">
      <section>
        <h2>操作</h2>
        <el-space>
          <el-button type="primary" :disabled="state.sharing" @click="onStartShare">
            开启共享
          </el-button>
          <el-button
            type="success"
            :disabled="!(state.sharing && !state.recording)"
            @click="onStartRecord">
            <span v-if="!state.recording">开始录制</span>
            <span v-else>
              录制中({{
                state.recordingTime > 0
                  ? formatMilliseconds(state.recordingTime).replace('0天00时', '')
                  : '0'
              }})
            </span>
          </el-button>
          <el-button
            type="warning"
            :disabled="!(state.sharing && state.recording)"
            @click="onStopRecord">
            停止录制
          </el-button>
          <el-button type="danger" :disabled="!state.sharing" @click="onStopShare">
            关闭共享
          </el-button>
        </el-space>
      </section>
      <section v-if="urlsRef.length" class="records">
        <h2>录屏列表</h2>
        <ul>
          <li v-for="(item, index) in urlsRef" :key="item">
            <video :src="item" controls />
            <el-space>
              <el-button type="danger" size="small" @click="onDelItem(index)">删除</el-button>
              <el-button type="primary" size="small" @click="onDownloadItem(index)">下载</el-button>
            </el-space>
          </li>
        </ul>
        <div class="end-line _ flex-col-c">
          <el-space>
            <el-button type="danger" size="large" @click="onClearAll">清理全部</el-button>
            <el-button type="primary" size="large" @click="onDownloadAll">下载全部</el-button>
          </el-space>
        </div>
      </section>
    </section>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
:deep(.record-widget-content) {
  ol {
    padding-left: 1rem;
  }
}

.tools-record {
  h2 {
    margin-bottom: 1rem;
  }
  .records {
    margin-top: 2rem;
    ul {
      margin: 1rem 0 1.5rem;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 1rem;
    }
  }
}
</style>
