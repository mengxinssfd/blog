<script lang="tsx" setup>
import { debounce, groupBy, sleep } from '@tool-pack/basic';
import { getRTCAnswer, getRTCOffer, setRTCAnswer, setRTCOffer } from '@blog/apis';
import { ElMessage } from 'element-plus';
import { usePermission } from '@vueuse/core';

const debSetRTCAnswer = debounce(setRTCAnswer, 500);
const debSetRTCOffer = debounce(setRTCOffer, 500);
// 信令服务器
const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

const token = ref('');
const conn = reactive<{
  RTCConn: RTCPeerConnection | null;
  connectionState: string;
  signalingState: string;
}>({
  RTCConn: null,
  connectionState: '',
  signalingState: '',
});
const isConnected = computed(() => conn.connectionState === 'connected');
const { state: permissionState, query: queryPermission } = usePermission('camera', {
  controls: true,
});
const isUpdatedPermission = ref(false);
const updatePermissionVisible = computed(() => {
  const state = permissionState.value;
  const isUpdated = isUpdatedPermission.value;
  if (!state) return true;
  if (state === 'prompt') return !isUpdated;
  return state !== 'denied' && state !== 'granted';
});
const localVideoRef = ref<HTMLVideoElement | null>(null);
const localStream = ref<MediaStream | null>(null);
const remoteStream = ref<MediaStream | null>(null);
const remoteVideoRef = ref<HTMLVideoElement | null>(null);
const localVisible = ref(true);
interface DeviceData {
  list: MediaDeviceInfo[];
  selected: undefined | string;
  checked: boolean;
}

const device = ref<{
  video: DeviceData;
  audio: DeviceData;
}>({
  video: {
    list: [],
    selected: 'default',
    checked: true,
  },
  audio: {
    list: [],
    selected: 'default',
    checked: true,
  },
});

onBeforeRouteLeave(disconnection);
onMounted(getDevices);

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
    await getUserMedia();
    pc.addEventListener('track', onTrack);
    // 创建offer并设置本地描述
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
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
  await getUserMedia();
  pc.addEventListener('track', onTrack);
  await pc.setRemoteDescription(offer.description);
  for (const candidate of offer.candidates) {
    await pc.addIceCandidate(candidate);
  }
  const answer = await pc.createAnswer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(answer);
}
function onTrack(e: RTCTrackEvent) {
  const videoEl = remoteVideoRef.value;
  if (!videoEl) return;
  const stream = e.streams[0];
  if (stream && videoEl.srcObject !== stream) {
    videoEl.srcObject = stream;
  }
}
function disconnection() {
  if (conn.RTCConn) conn.RTCConn.close();
  if (localStream.value) localStream.value.getTracks().forEach((t) => t.stop());
  if (remoteStream.value) remoteStream.value.getTracks().forEach((t) => t.stop());
  conn.connectionState = conn.signalingState = '';
  conn.RTCConn = null;
}
function setConnectionState(con: RTCPeerConnection) {
  if (con.connectionState === 'disconnected') {
    disconnection();
    return;
  }
  conn.signalingState = con.signalingState;
  conn.connectionState = con.connectionState;
}
async function updateDevices() {
  await queryPermission();
  if (permissionState.value !== 'granted') {
    isUpdatedPermission.value = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((t) => t.stop());
    getDevices();
  }
}
async function getDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.error('Devices not supported');
    return;
  }
  const _devices = await navigator.mediaDevices.enumerateDevices();
  const group = groupBy(
    _devices.filter((d) => d.deviceId && d.deviceId !== 'default'),
    'kind',
  );
  device.value = {
    video: {
      list: group.videoinput || [],
      selected: group.videoinput?.[0]?.deviceId || '',
      checked: device.value.video.checked,
    },
    audio: {
      list: group.audioinput || [],
      selected: group.audioinput?.[0]?.deviceId || '',
      checked: device.value.audio.checked,
    },
  };
}
async function getUserMedia() {
  const { audio, video } = device.value;
  if (!video.checked && !audio.checked) return;

  const ls = (localStream.value = await navigator.mediaDevices.getUserMedia({
    audio: audio.checked
      ? audio.selected === 'default'
        ? true
        : { deviceId: audio.selected }
      : false,
    video: video.checked
      ? video.selected === 'default'
        ? true
        : { deviceId: video.selected }
      : false,
  }));
  localVideoRef.value && (localVideoRef.value.srcObject = ls);
  ls.getTracks().forEach((track) => conn.RTCConn!.addTrack(track, ls));
}
</script>
<template>
  <section class="rtc-camera">
    <h2>
      视频通话
      <span v-if="conn.connectionState && conn.signalingState">
        连接状态：{{ `${conn.connectionState} | ${conn.signalingState}` }}
      </span>
    </h2>
    <section>
      <el-space spacer="|" style="flex-wrap: wrap">
        <el-button
          v-if="updatePermissionVisible"
          type="primary"
          size="small"
          @click="updateDevices">
          更新设备列表
        </el-button>
        <el-space>
          摄像头：
          <input v-model="device.video.checked" type="checkbox" :disabled="isConnected" />
          <select
            v-if="device.video.list.length"
            v-model="device.video.selected"
            :disabled="isConnected">
            <option
              v-for="d in device.video.list"
              :key="d.deviceId"
              :value="d.deviceId"
              :label="d.label" />
          </select>
        </el-space>
        <el-space>
          麦克风：
          <input v-model="device.audio.checked" type="checkbox" :disabled="isConnected" />
          <select
            v-if="device.audio.list.length"
            v-model="device.audio.selected"
            :disabled="isConnected">
            <option
              v-for="d in device.audio.list"
              :key="d.deviceId"
              :value="d.deviceId"
              :label="d.label" />
          </select>
        </el-space>
        <el-space> 显示本地视频: <input v-model="localVisible" type="checkbox" /> </el-space>
      </el-space>
    </section>
    <section>
      <el-space>
        <template v-if="!conn.RTCConn">
          <el-input v-model.trim="token" placeholder="口令" autofocus />
          <el-button type="primary" :disabled="!token" @click="onClickCreate">创建口令</el-button>
          <el-button type="primary" :disabled="!token" @click="onClickReceive">
            连接口令
          </el-button>
        </template>
        <el-button v-if="conn.RTCConn" type="danger" @click="disconnection"> 断开连接 </el-button>
      </el-space>
    </section>
    <section>
      <el-space>
        <div v-show="localVisible && (device.video.checked || device.audio.checked)">
          <div>本地</div>
          <video ref="localVideoRef" autoplay controls></video>
        </div>
        <div>
          <div>远程</div>
          <video ref="remoteVideoRef" autoplay controls></video>
        </div>
      </el-space>
    </section>
  </section>
</template>

<style lang="scss" scoped>
.rtc-camera {
  > section {
    margin-top: 0.8rem;
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

  ul {
    margin-bottom: 1rem;
  }

  li {
    margin-top: 0.5rem;
  }
}
</style>
