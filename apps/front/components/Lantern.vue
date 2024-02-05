<script lang="ts" setup>
defineProps({
  content: {
    type: String,
    default: '',
  },
  lineHeight: {
    type: [String, Number],
    default: '80px',
  },
});
</script>
<template>
  <div class="c-lantern">
    <div class="line" :style="{ height: lineHeight }"></div>
    <div class="header"></div>
    <div class="body">
      <div class="content">{{ content }}</div>
    </div>
    <div class="footer"></div>
    <div class="ears"></div>
  </div>
</template>

<style lang="scss" scoped>
.c-lantern {
  position: fixed;
  top: 0;
  z-index: 10;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  .header,
  .footer {
    position: relative;
    z-index: 2;
    height: 12px;
    width: 60px;
    border: solid 1px #dc8f03;
    background: #ffa500;
  }
  .header {
    margin-bottom: -6px;
    border-radius: 5px 5px 0 0;
    background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
  }
  .footer {
    margin-top: -6px;
    border-radius: 0 0 5px 5px;
    background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
  }
  .body {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 120px;
    height: 90px;
    //margin: 50px;
    background: #d8000f;
    background: rgba(216, 0, 15, 0.8);
    border-radius: 50% 50%;
    transform-origin: 50% -100px;
    //animation: swing 3s infinite ease-in-out;
    box-shadow: -5px 5px 50px 4px rgba(250, 108, 0, 1);
    &:before,
    &:after {
      position: absolute;
      left: 50%;
      top: 0;
      height: 100%;
      transform: translateX(-50%);
      border: 2px solid #dc8f03;
      border-radius: 50%;
      content: '';
    }
    &:before {
      width: 80%;
    }
    &:after {
      width: 45%;
    }
  }
  .line {
    width: 2px;
    background: #dc8f03;
  }
  .ears {
    position: relative;
    width: 5px;
    height: 20px;
    //animation: swing 4s infinite ease-in-out;
    background: #ffa500;
    border-radius: 0 0 5px 5px;
    &:before {
      position: absolute;
      top: 14px;
      left: -2px;
      width: 10px;
      height: 10px;
      background: #dc8f03;
      border-radius: 50%;
      content: '';
    }
    &:after {
      position: absolute;
      top: 18px;
      left: -2px;
      width: 10px;
      height: 35px;
      background: #ffa500;
      border-radius: 0 0 0 5px;
      content: '';
    }
  }
  .content {
    position: relative;
    z-index: 2;
    font-family: 华文行楷, Arial, Lucida Grande, Tahoma, sans-serif;
    font-size: 3.2rem;
    color: #dc8f03;
    font-weight: bold;
    line-height: 85px;
    text-align: center;
  }
  @keyframes swing {
    0% {
      transform: rotate(-10deg);
    }
    50% {
      transform: rotate(10deg);
    }
    100% {
      transform: rotate(-10deg);
    }
  }
}
@keyframes swing {
  0% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(-10deg);
  }
}
</style>
