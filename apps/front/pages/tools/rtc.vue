<script setup lang="ts">
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
interface SendState {
  status: 'padding' | 'wait' | 'ready';
  RTCConn: RTCPeerConnection | null;
  files: SendFile[];
  dataChannel: null | RTCDataChannel;
}
interface ReceiveFile {
  filename: string;
  progress: number;
  size: number;
  file?: File;
  chunks: ArrayBuffer[];
}
interface ReceiveState {
  RTCConn: RTCPeerConnection | null;
  files: ReceiveFile[];
}
interface TransportFormat {
  size: number;
  filename: string;
}

const ChunkSize = 1024 * 16;
// 信令服务器
const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
const binaryType: BinaryType = 'arraybuffer';
const status = ref<'send' | 'receive'>();
const articleAs = ref<ArticleEntity>();
const token = ref('');
const sendState = reactive<SendState>({
  status: 'padding',
  dataChannel: null,
  RTCConn: null,
  files: [],
});
const receiveState = reactive<ReceiveState>({
  RTCConn: null,
  files: [],
});
const connStatus = ref('');

onBeforeRouteLeave(() => {
  if (sendState.RTCConn) sendState.RTCConn.close();
  if (receiveState.RTCConn) receiveState.RTCConn.close();
});

async function onClickCreate() {
  if (!token.value) return;
  try {
    // 创建RTCPeerConnection对象
    const pc = (sendState.RTCConn = new RTCPeerConnection({ iceServers }));

    pc.onconnectionstatechange = (e) => {
      setConnectionState(e.target as RTCPeerConnection);
    };

    const candidates: RTCIceCandidateInit[] = [];
    pc.addEventListener('icecandidate', async (event) => {
      if (event.candidate) {
        candidates.push(event.candidate);
        // 发送offer和candidate给服务端
        await debSetRTCOffer({ token: token.value, candidates, description: offer });
        sendState.status = 'wait';
      }
    });

    const sendChannel = (sendState.dataChannel = pc.createDataChannel('sendDataChannel'));
    sendChannel.binaryType = binaryType;

    // 创建offer并设置本地描述
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function onClickCheckSendConn() {
  const pc = sendState.RTCConn;
  if (!pc) return;
  const answer = await getRTCAnswer(token.value);
  if (!answer) {
    ElMessage.warning(`尚未有接收端连接，请稍后再试`);
    return;
  }
  // 设置远程描述
  await pc.setRemoteDescription(answer.description);
  for (const candidate of answer.candidates) {
    await pc.addIceCandidate(candidate);
  }
  sendState.status = 'ready';
}
function onClickSelectFile() {
  const input = createHiddenHtmlElement(
    {
      type: `file`,
      multiple: true,
      onchange(ev: Event) {
        const { files } = ev.target as HTMLInputElement;
        files && (sendState.files = Array.from(files).map((file) => ({ file, progress: 0 })));
        input.remove();
      },
    },
    'input',
  );
  input.click();
}
async function onClickSend() {
  const { files, dataChannel } = sendState;
  if (!files.length || !dataChannel) return;

  if (dataChannel.readyState !== 'open') {
    ElMessage.error('未连接状态无法发送');
    return;
  }

  for (const fileObj of files) {
    const { file } = fileObj;
    // 先发一个信息提示这是个新文件;
    // 主要是 ArrayBuffer 序列化有各种问题，要么中文乱码，要么 Blob slice 一个单数长度的 ArrayBuffer 导致 Uint16Array报错
    // 还是提示归提示，文件流归文件流，也省的每个都要 encode、decode
    const data = encodeObjectToArrayBuffer({
      filename: file.name,
      size: file.size,
    });
    dataChannel.send(data);
    // 分片传输
    await sliceBlobAsync({
      blob: file,
      chunkSize: ChunkSize,
      cb: async (slice, _start, end) => {
        fileObj.progress = end;
        dataChannel.send(slice);
        // 如果缓冲的数据大于 5 倍分片大小，则暂停并等待数据发送，
        // 否则如果 send 停止太久浏览器会停止发送数据
        while (dataChannel.bufferedAmount > ChunkSize * 5) {
          await sleep(10);
        }
      },
    });
  }
}

async function onClickReceive() {
  if (!token.value) return;
  // 创建RTCPeerConnection对象
  const pc = (receiveState.RTCConn = new RTCPeerConnection({ iceServers }));

  pc.addEventListener('datachannel', (event) => {
    const receiveChannel = event.channel;
    receiveChannel.binaryType = binaryType;

    receiveChannel.onmessage = (event) => {
      const tf = parseChannelData(event.data);
      if (tf instanceof ArrayBuffer) {
        const fileObj = receiveState.files[receiveState.files.length - 1];
        fileObj.chunks.push(tf);
        fileObj.progress += tf.byteLength;
        if (fileObj.progress === fileObj.size) {
          fileObj.file = new File(fileObj.chunks, fileObj.filename);
        }
      } else {
        receiveState.files.push({
          filename: tf.filename,
          progress: 0,
          size: tf.size,
          chunks: [],
        });
      }
    };
  });

  const offer = await getRTCOffer(token.value);
  if (!offer) {
    ElMessage.error(`token '${token.value}' not found`);
    return;
  }

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
  receiveState.files.forEach((file) => {
    if (!file.file) return;
    download(file.filename, file.file);
  });
}
function setConnectionState(conn: RTCPeerConnection) {
  connStatus.value = `${conn.connectionState} | ${conn.signalingState}`;
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
          选择发送或接收文件
          <span v-if="connStatus" class="conn-status">连接状态：{{ connStatus }}</span>
        </h2>
        <el-radio-group v-model="status">
          <el-radio value="send">发送</el-radio>
          <el-radio value="receive">接收</el-radio>
        </el-radio-group>
      </section>
      <template v-if="status === 'send'">
        <section>
          <h2>发送文件</h2>
          <el-space>
            <template v-if="sendState.status === 'padding'">
              <el-input
                v-model.trim="token"
                placeholder="口令"
                autofocus
                @keydown.enter="onClickCreate" />
              <el-button type="primary" :disabled="!token" @click="onClickCreate">创建</el-button>
            </template>
            <el-button v-else-if="sendState.status === 'wait'" @click="onClickCheckSendConn">
              检查连接状态
            </el-button>
            <template v-else-if="sendState.status === 'ready'">
              <el-button v-if="!sendState.files.length" type="success" @click="onClickSelectFile">
                选择文件
              </el-button>
              <el-button v-else type="warning" @click="() => (sendState.files.length = 0)">
                清理已选文件
              </el-button>
            </template>
          </el-space>
        </section>
        <section class="file-list">
          <h2>文件列表：</h2>
          <ul>
            <li v-for="(file, index) in sendState.files" :key="file.file.name">
              <el-space>
                <span>{{ file.file.name }}</span>
                <el-divider direction="vertical" />
                <span>
                  {{ customFormatBytes(file.progress) }}/{{ customFormatBytes(file.file.size) }}
                </span>
                <el-divider direction="vertical" />
                <el-button
                  type="warning"
                  size="small"
                  @click="() => sendState.files.splice(index, 1)">
                  删除
                </el-button>
              </el-space>
            </li>
          </ul>
          <el-button v-if="sendState.files.length" type="success" @click="onClickSend">
            发送文件
          </el-button>
        </section>
      </template>
      <template v-else-if="status === 'receive'">
        <section v-if="receiveState.RTCConn?.signalingState !== 'stable'">
          <h2>接收文件</h2>
          <el-space>
            <el-input
              v-model.trim="token"
              placeholder="口令"
              autofocus
              @keydown.enter="onClickReceive" />
            <el-button type="primary" :disabled="!token" @click="onClickReceive">连接</el-button>
          </el-space>
        </section>
        <section class="file-list">
          <h2>文件列表：</h2>
          <ul>
            <li v-for="file in receiveState.files" :key="file.filename">
              <el-space>
                <span>{{ file.filename }}</span>
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
              </el-space>
            </li>
          </ul>
          <el-button v-if="receiveState.files.length" type="primary" @click="downloadAll">
            ⏬ 下载全部
          </el-button>
        </section>
      </template>
    </section>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
:deep(.record-widget-content) {
  ol {
    padding-left: 1rem;
  }
}

.tools-rtc {
  h2 {
    margin-bottom: 1rem;
  }
  > section {
    margin-top: 2rem;
    ul {
      margin-bottom: 1rem;
    }
    li {
      margin-top: 0.5rem;
    }
  }
  .conn-status {
    margin-left: 0.5rem;
    font-size: 12px;
  }
}
</style>
