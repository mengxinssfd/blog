<script setup lang="tsx">
import type { ArticleEntity } from '@blog/entities';
import { USER_ROLE } from '@blog/entities/constant';
import { blobToBase64, base64ToBlob, download, loadImg, readFile } from '@tool-pack/dom';
import { formatBytes } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import useUserStore from '~/store/user.store';

const userStore = useUserStore();
const article = ref<ArticleEntity>({} as ArticleEntity);

const [files, triggerFileSelector] = useFileSelector('image/*');

interface T {
  blob: null | Blob;
  base64: string;
  width: number;
  height: number;
}
const beforeImg = reactive<T>({
  blob: null,
  base64: '',
  width: 0,
  height: 0,
});
const afterImg = reactive<T>({
  blob: null,
  base64: '',
  width: 0,
  height: 0,
});

const options = reactive<{
  type: 'png' | 'jpeg' | 'webp';
  quality: number;
  width: number;
  height: number;
  sizeType: 'rate' | 'custom';
  sizeRate: number;
}>({
  type: 'webp',
  quality: 0.85,
  width: 0,
  height: 0,
  sizeType: 'rate',
  sizeRate: 100,
});

const setOptionsSizeByRate = () => {
  const rate = options.sizeRate;
  options.width = ~~((rate * beforeImg.width) / 100);
  options.height = ~~((rate * beforeImg.height) / 100);
};

const restoreSize = () => {
  options.sizeRate = 100;
  setOptionsSizeByRate();
};

const sizeCompareStatus = computed(() => {
  const b = beforeImg.blob?.size || 0;
  const a = afterImg.blob?.size || 0;

  if (a > b) return '-1';
  if (a === b) return '0';
  return '1';
});
const sizeCompareRate = computed(() => {
  const b = beforeImg.blob?.size || 0;
  const a = afterImg.blob?.size || 0;

  if (!a || !b) return 0;
  return ((a / b) * 100).toFixed(2);
});

watch(
  () => options.sizeRate,
  () => options.sizeType === 'rate' && setOptionsSizeByRate(),
);

const previewList = computed(() => [beforeImg.base64, afterImg.base64].filter(Boolean));
const afterFilename = computed(() => {
  if (!beforeImg.blob) return '';
  const filename = beforeImg.blob.name.replace(/\.[^.]+$/, '');
  const ext = options.type === 'jpeg' ? 'jpg' : options.type;
  return `${filename}.${ext}`;
});

function transformImgType(input: Blob, type: string, quality = 1): Promise<string> {
  const handle = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    canvas.getContext('2d')?.drawImage(img, 0, 0, options.width, options.height);
    return canvas.toDataURL(type, quality);
  };

  return readFile(input, 'readAsDataURL').then((res) => loadImg(res as string).then(handle));
}

const transform = async () => {
  const type = options.type;
  const file = beforeImg.blob;
  if (!file) return;
  const res = await transformImgType(file, `image/${type}`, options.quality);
  afterImg.base64 = res;
  afterImg.blob = await base64ToBlob(res);
  const img = await loadImg(afterImg.base64);
  afterImg.width = img.naturalWidth;
  afterImg.height = img.naturalHeight;
};

const setFile = async (files?: ArrayLike<Blob>) => {
  const file = files?.[0];
  if (!file || !/^image\/.+/.test(file.type)) return;

  beforeImg.blob = file;
  beforeImg.base64 = await blobToBase64(file);
  const img = await loadImg(beforeImg.base64);
  beforeImg.width = img.naturalWidth;
  beforeImg.height = img.naturalHeight;

  afterImg.blob = null;
  afterImg.base64 = '';
  afterImg.width = 0;
  afterImg.height = 0;

  setOptionsSizeByRate();
};

const onDrop = (event: DragEvent) => {
  const dt = event.dataTransfer;
  setFile(dt?.files);
};
watch(files, setFile);

const downloadImg = () => {
  const blob = afterImg.blob;
  if (!beforeImg.blob || !blob) return;
  ElMessageBox.prompt('文件名', { type: 'info', inputValue: afterFilename.value }).then((v) => {
    download(v.value, blob);
  });
};
</script>

<template>
  <ArticleAsPage as="tools/transform-img-type" @data="article = $event">
    <template #aside>
      <WidgetUpload v-if="userStore.user.role <= USER_ROLE.dev" />
      <WidgetSentence />
      <WidgetCountdown />
    </template>
    <section
      class="drop-target board _ flex-col"
      @drop.stop.prevent="onDrop"
      @dragover.stop.prevent>
      <section>
        <div class="align-right">
          <el-button type="primary" size="large" @click="triggerFileSelector">选择文件</el-button>
        </div>
      </section>
      <section class="img-compare _ flex-c">
        <div class="before _ flex-col flex-1">
          <p>原图</p>
          <div class="img-box">
            <el-image
              v-if="beforeImg.base64"
              :src="beforeImg.base64"
              fit="contain"
              :initial-index="0"
              :preview-src-list="previewList"
              preview-teleported />
          </div>
          <div class="info">
            <span>类型: {{ beforeImg.blob?.type || '--' }}</span>
            <el-divider direction="vertical" />
            <span>大小:{{ formatBytes(beforeImg.blob?.size || 0) }}</span>
            <el-divider direction="vertical" />
            <span>尺寸:{{ beforeImg.width }} * {{ beforeImg.height }}</span>
          </div>
        </div>
        <Space width="6px" />
        <div class="after _ flex-col flex-1">
          <p>转换后</p>
          <div class="img-box">
            <el-image
              v-if="afterImg.base64"
              :src="afterImg.base64"
              fit="contain"
              :initial-index="1"
              :preview-src-list="previewList"
              preview-teleported />
          </div>
          <div class="info">
            <span>类型: image/{{ options.type }}</span>
            <el-divider direction="vertical" />
            <span>
              大小:
              <span
                :style="{ color: { '1': 'lime', '-1': 'red', '0': 'inherit' }[sizeCompareStatus] }">
                {{ formatBytes(afterImg.blob?.size || 0) }}
                ({{ sizeCompareRate }}%)
              </span>
            </span>
            <el-divider direction="vertical" />
            <span>尺寸:{{ afterImg.width }} * {{ afterImg.height }}</span>
          </div>
        </div>
      </section>

      <section class="options">
        <el-form inline>
          <el-form-item label="类型：">
            <el-radio-group v-model="options.type" size="large">
              <el-radio-button label="webp">webp</el-radio-button>
              <el-radio-button label="png">png</el-radio-button>
              <el-radio-button label="jpeg">jpeg</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="质量：">
            <ClientOnly>
              <el-slider v-model="options.quality" :min="0.01" :max="1" :step="0.01" />
            </ClientOnly>
          </el-form-item>
          <el-form-item label="尺寸：">
            <div class="_ flex-1 size-items">
              <div class="size-type">
                <el-radio-group v-model="options.sizeType" size="large">
                  <el-radio-button label="custom">自定义</el-radio-button>
                  <el-radio-button label="rate">按比例缩放</el-radio-button>
                </el-radio-group>
              </div>
              <div class="_ flex-c flex-wrap">
                <span class="label">width</span>
                <el-input-number
                  v-model="options.width"
                  :disabled="options.sizeType !== 'custom'"
                  class="el-restore-default"
                  size="large"
                  :min="1" />
                <el-divider direction="vertical" />
                <span class="label">height</span>
                <el-input-number
                  v-model="options.height"
                  :disabled="options.sizeType !== 'custom'"
                  class="el-restore-default"
                  size="large"
                  :min="1" />
              </div>
              <div class="_ flex-c">
                <span class="label">比例</span>
                <ClientOnly>
                  <el-slider
                    v-model="options.sizeRate"
                    :disabled="options.sizeType !== 'rate'"
                    :format-tooltip="(v:string) => v + '%'"
                    :min="1"
                    :max="100"
                    :step="1" />
                </ClientOnly>
              </div>
              <div>
                <el-button type="success" @click="restoreSize"> 尺寸还原 </el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </section>

      <section class="btns">
        <el-button type="primary" size="large" :disabled="!beforeImg.base64" @click="transform">
          转换
        </el-button>
        <el-button type="primary" size="large" :disabled="!afterImg.base64" @click="downloadImg">
          下载
        </el-button>
      </section>
    </section>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
.drop-target {
  min-height: 200px;
  .file-selector {
    display: none;
  }
  .img-compare {
    margin: 1rem 0;
  }
  .img-box {
    margin: 10px 0;
    height: 300px;
    background: var(--link-hover-bg-color);
    .el-image {
      width: 100%;
      height: 100%;
    }
  }
  .btns {
    margin: 2rem 0;
    text-align: center;
  }
  .el-slider {
    width: 260px;
  }
  section.options {
    padding: 1rem;
    background: var(--link-hover-bg-color);
    .el-form-item {
      margin-bottom: 24px;
      .label {
        margin: 0 6px 0 6px;
      }
    }
  }
  .size-items {
    > div {
      margin-bottom: 1rem;
    }
  }
}
</style>
