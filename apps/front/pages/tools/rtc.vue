<script setup lang="tsx">
import { createHiddenHtmlElement, download, sliceBlobAsync } from '@tool-pack/dom';
import { ElMessage } from 'element-plus';
import type { ArticleEntity } from '@blog/entities';
import { getRTCAnswer, getRTCOffer, setRTCAnswer, setRTCOffer } from '@blog/apis';
import {
  debounce,
  decodeArrayBufferToObject,
  encodeObjectToArrayBuffer,
  formatBytes,
  sleep,
} from '@tool-pack/basic';

const debSetRTCAnswer = debounce(setRTCAnswer, 500);
const debSetRTCOffer = debounce(setRTCOffer, 500);
const customFormatBytes = (value: number) => {
  const str = formatBytes(value);
  if (str.includes('.')) {
    return str.replace(/\.(\d)(\w)B$/, '.$10$2B');
  }
  return str.replace(/^(\d+)/, '$1.00');
};

interface SendFile {
  progress: number;
  file: File;
}
interface ReceiveFile {
  filename: string;
  progress: number;
  size: number;
  file?: File;
  chunks: ArrayBuffer[];
  type: string;
}
interface TransportFormat {
  size: number;
  filename: string;
  type: string;
}

const ChunkSize = 1024 * 16;
// 信令服务器
const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
const articleAs = ref<ArticleEntity>();
const token = ref('');
const sendFiles = reactive<SendFile[]>([]);
const receiveFiles = reactive<ReceiveFile[]>([]);
const conn = reactive<{
  RTCConn: RTCPeerConnection | null;
  dataChannel: null | RTCDataChannel;
  connectionState: string;
  signalingState: string;
}>({
  dataChannel: null,
  RTCConn: null,
  connectionState: '',
  signalingState: '',
});
const isConnected = computed(() => conn.connectionState === 'connected');
const [receiveSpeed, setReceiveSpeedProgress, resetReceiveSpeedProgress] = useNetSpeed();
const [sendSpeed, setSendSpeedProgress, resetSendSpeedProgress] = useNetSpeed();

onBeforeRouteLeave(disconnection);

async function onClickCreate() {
  if (!token.value) return;
  try {
    // 创建RTCPeerConnection对象
    const pc = new RTCPeerConnection({ iceServers });
    conn.RTCConn = pc;
    let times = 0;
    const checkConn = async () => {
      if (times++ >= 3) return;
      await sleep(1500);
      checkSendConn().catch(checkConn);
    };
    pc.onconnectionstatechange = (e) => {
      const con = e.target as RTCPeerConnection;
      setConnectionState(con);
      if (con.connectionState === 'connecting' && con.signalingState === 'have-local-offer') {
        checkConn();
      }
    };

    const candidates: RTCIceCandidateInit[] = [];
    pc.addEventListener('icecandidate', async (event) => {
      if (event.candidate) {
        candidates.push(event.candidate);
        // 发送offer和candidate给服务端
        await debSetRTCOffer({ token: token.value, candidates, description: offer });
      }
    });

    conn.dataChannel = pc.createDataChannel('sendDataChannel');
    initDataChannel();

    // 创建offer并设置本地描述
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function checkSendConn() {
  const pc = conn.RTCConn;
  if (!pc) return;
  const answer = await getRTCAnswer(token.value);
  if (!answer) return;
  // 设置远程描述
  await pc.setRemoteDescription(answer.description);
  for (const candidate of answer.candidates) {
    await pc.addIceCandidate(candidate);
  }
}
function onClickSelectFile() {
  const input = createHiddenHtmlElement(
    {
      type: `file`,
      multiple: true,
      onchange(ev: Event) {
        const { files } = ev.target as HTMLInputElement;
        if (files && files.length) {
          const fileArr = Array.from(files).filter(
            (i) => !sendFiles.some((sf) => isSameFile(sf.file, i)),
          );
          sendFiles.push(...fileArr.map((file) => ({ file, progress: 0 })));
        }
        input.remove();
      },
    },
    'input',
  );
  input.click();
}
function isSameFile(a: File, b: File): boolean {
  return (
    a.lastModified === b.lastModified && a.name === b.name && a.size === b.size && a.type === b.type
  );
}
async function onClickSendAll() {
  const files = sendFiles;
  if (!files.length) return;
  for (const fileObj of files) {
    await sendFile(fileObj);
  }
}
async function sendFile(fileObj: SendFile) {
  const dc = conn.dataChannel;
  if (!dc) return;

  if (dc.readyState !== 'open') {
    ElMessage.error('未连接状态无法发送');
    return;
  }

  const { file, progress } = fileObj;
  if (progress === file.size) return;
  // 先发一个信息提示这是个新文件;
  // 主要是 ArrayBuffer 序列化有各种问题，要么中文乱码，要么 Blob slice 一个单数长度的 ArrayBuffer 导致 Uint16Array报错
  // 还是提示归提示，文件流归文件流，也省的每个都要 encode、decode
  const data = encodeObjectToArrayBuffer({
    filename: file.name,
    size: file.size,
    type: file.type,
  } as TransportFormat);
  dc.send(data);
  resetSendSpeedProgress();
  // 分片传输
  await sliceBlobAsync({
    blob: file,
    chunkSize: ChunkSize,
    cb: async (slice, _start, end) => {
      fileObj.progress = end;
      setSendSpeedProgress(end);
      dc.send(slice);
      // 如果缓冲的数据大于 5 倍分片大小，则暂停并等待数据发送，
      // 否则如果 send 停止太久浏览器会停止发送数据
      while (dc.bufferedAmount > ChunkSize * 5) {
        await sleep(10);
      }
    },
  });
  resetSendSpeedProgress();
}
async function onClickReceive() {
  if (!token.value) return;
  const offer = await getRTCOffer(token.value);

  if (!offer) {
    ElMessage.error(`token '${token.value}' not found`);
    return;
  }

  // 创建RTCPeerConnection对象
  const pc = new RTCPeerConnection({ iceServers });
  conn.RTCConn = pc;
  pc.addEventListener('datachannel', (event) => {
    conn.dataChannel = event.channel;
    initDataChannel();
  });

  const candidates: RTCIceCandidateInit[] = [];
  pc.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      candidates.push(event.candidate);
      debSetRTCAnswer({
        token: token.value,
        candidates,
        description: answer,
      });
    }
  });

  pc.onconnectionstatechange = (e) => {
    setConnectionState(e.target as RTCPeerConnection);
  };
  await pc.setRemoteDescription(offer.description);
  for (const candidate of offer.candidates) {
    await pc.addIceCandidate(candidate);
  }
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
}
function disconnection() {
  if (conn.dataChannel) conn.dataChannel.close();
  if (conn.RTCConn) conn.RTCConn.close();
  conn.dataChannel = conn.RTCConn = null;
  conn.connectionState = conn.signalingState = '';
}
function initDataChannel() {
  const { dataChannel } = conn;
  if (!dataChannel) return;

  dataChannel.binaryType = 'arraybuffer';
  dataChannel.onmessage = (event: MessageEvent) => {
    const tf = parseChannelData(event.data);

    if (tf instanceof ArrayBuffer) {
      const fileObj = receiveFiles[receiveFiles.length - 1];
      fileObj.chunks.push(tf);
      fileObj.progress += tf.byteLength;
      setReceiveSpeedProgress(fileObj.progress);
      if (fileObj.progress === fileObj.size) {
        fileObj.file = new File(fileObj.chunks, fileObj.filename, { type: fileObj.type });
        resetReceiveSpeedProgress();
      }
    } else {
      resetReceiveSpeedProgress();
      receiveFiles.push({
        filename: tf.filename,
        progress: 0,
        size: tf.size,
        chunks: [],
        type: tf.type,
      });
    }
  };
}
function parseChannelData(data: ArrayBuffer): TransportFormat | ArrayBuffer {
  if (data.byteLength < ChunkSize) {
    try {
      const tf = decodeArrayBufferToObject<TransportFormat>(data);
      if (!tf) return data;
      return tf;
    } catch {
      return data;
    }
  }
  return data;
}
function downloadFile(file: File) {
  download(file.name, file);
}
function downloadAll() {
  receiveFiles.forEach((file) => {
    if (!file.file) return;
    download(file.filename, file.file);
  });
}
function setConnectionState(con: RTCPeerConnection) {
  if (con.connectionState === 'disconnected') {
    disconnection();
    return;
  }
  conn.signalingState = con.signalingState;
  conn.connectionState = con.connectionState;
}
function getFileSrc(file?: File) {
  if (!file) return undefined;
  return URL.createObjectURL(file);
}
function Preview({ file }: { file: File }) {
  if (!file) return;
  if (file.type.startsWith('video/')) {
    return <video src={getFileSrc(file)} controls></video>;
  }
  if (file.type.startsWith('image/')) {
    return <img src={getFileSrc(file)} alt={file.name} />;
  }
}
</script>

<template>
  <ArticleAsPage as="tools/rtc" @data="articleAs = $event">
    <template #aside>
      <Widget class="rtc-widget">
        <div
          v-if="articleAs?.content"
          class="record-widget-content"
          v-html="articleAs.content"></div>
        <div v-else class="rules">
          <el-skeleton :rows="6" animated />
        </div>
      </Widget>
    </template>
    <section class="tools-rtc board">
      <section>
        <h2>
          文件传输助手
          <span v-if="conn.connectionState && conn.signalingState">
            连接状态：{{ `${conn.connectionState} | ${conn.signalingState}` }}
          </span>
        </h2>
        <el-space>
          <template v-if="!conn.RTCConn">
            <el-input v-model.trim="token" placeholder="口令" autofocus />
            <el-button type="primary" :disabled="!token" @click="onClickCreate">创建口令</el-button>
            <el-button type="primary" :disabled="!token" @click="onClickReceive">
              连接口令
            </el-button>
          </template>
          <el-button v-if="conn.dataChannel || conn.RTCConn" type="danger" @click="disconnection">
            断开连接
          </el-button>
        </el-space>
      </section>
      <section v-if="isConnected || sendFiles.length" class="file-list">
        <h2>
          发送列表：<span>{{ customFormatBytes(sendSpeed) }}/s</span>
        </h2>
        <ul>
          <li v-for="(file, index) in sendFiles" :key="file.file.name">
            <el-space>
              <span class="filename">{{ file.file.name }}</span>
              <el-divider direction="vertical" />
              <span>
                {{ customFormatBytes(file.progress) }}/{{ customFormatBytes(file.file.size) }}
              </span>
              <el-divider direction="vertical" />
              <el-button type="warning" size="small" @click="() => sendFiles.splice(index, 1)">
                移除
              </el-button>
              <template v-if="false">
                <!-- 如果有一个发送中，然后点击发送其他文件会导致麻烦问题，所以先不开单个发送 -->
                <el-divider direction="vertical" />
                <el-button
                  v-if="file.progress !== file.file.size"
                  type="success"
                  size="small"
                  @click="sendFile(file)">
                  发送
                </el-button>
              </template>
            </el-space>
            <div v-if="file.file" class="preview">
              <Preview :file="file.file" />
            </div>
          </li>
        </ul>
        <el-space>
          <el-button v-if="isConnected" type="primary" @click="onClickSelectFile">
            选择文件
          </el-button>
          <template v-if="sendFiles.length">
            <el-button type="warning" @click="() => (sendFiles.length = 0)"> 移除全部 </el-button>
            <el-button
              v-if="isConnected"
              type="success"
              :disabled="sendFiles.every((i) => i.progress === i.file.size)"
              @click="onClickSendAll">
              发送全部
            </el-button>
          </template>
        </el-space>
      </section>
      <section v-if="receiveFiles.length" class="file-list">
        <h2>
          接收列表： <span>{{ customFormatBytes(receiveSpeed) }}/s</span>
        </h2>
        <ul>
          <li v-for="(file, index) in receiveFiles" :key="file.filename">
            <el-space>
              <span class="filename">{{ file.filename }}</span>
              <el-divider direction="vertical" />
              <span>
                {{ customFormatBytes(file.progress) }}/{{ customFormatBytes(file.size) }}
              </span>
              <el-divider direction="vertical" />
              <el-button
                v-if="file.file"
                type="primary"
                size="small"
                @click="downloadFile(file.file)">
                ⏬ 下载
              </el-button>
              <el-divider direction="vertical" />
              <el-button type="warning" size="small" @click="() => receiveFiles.splice(index, 1)">
                移除
              </el-button>
            </el-space>
            <div v-if="file.file" class="preview">
              <Preview :file="file.file" />
            </div>
          </li>
        </ul>
        <el-button v-if="receiveFiles.length" type="primary" @click="downloadAll">
          ⏬ 下载全部
        </el-button>
      </section>
    </section>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
.tools-rtc {
  h2 {
    margin-bottom: 1rem;
    span {
      margin-left: 0.5rem;
      font-size: 12px;
    }
  }
  > section {
    & + section {
      margin-top: 2rem;
    }
    ul {
      margin-bottom: 1rem;
    }
    li {
      margin-top: 0.5rem;
    }
  }
  .filename {
    word-break: break-all;
  }
  .preview {
    video,
    img {
      max-width: 380px;
    }
  }
}
</style>
