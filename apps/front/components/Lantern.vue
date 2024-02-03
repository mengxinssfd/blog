<script lang="ts" setup>
defineProps({
  content: {
    type: String,
    default: '',
  },
});
</script>
<template>
  <div class="c-lantern">
    <div class="box">
      <div class="line"></div>
      <div class="body">
        <div class="inner">
          <div class="content">{{ content }}</div>
        </div>
      </div>
      <div class="ears"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.c-lantern {
  pointer-events: none;
  position: fixed;
  top: 50px;
  z-index: 999;
  .box {
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
    &:before {
      position: absolute;
      top: -7px;
      left: 29px;
      height: 12px;
      width: 60px;
      content: ' ';
      display: block;
      z-index: 999;
      border-radius: 5px 5px 0 0;
      border: solid 1px #dc8f03;
      background: #ffa500;
      background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
    }
    &:after {
      position: absolute;
      bottom: -7px;
      left: 10px;
      height: 12px;
      width: 60px;
      content: ' ';
      display: block;
      margin-left: 20px;
      border-radius: 0 0 5px 5px;
      border: solid 1px #dc8f03;
      background: #ffa500;
      background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
    }
  }
  .body {
    width: 100px;
    height: 90px;
    background: #d8000f;
    background: rgba(216, 0, 15, 0.1);
    margin: 12px 8px 8px 8px;
    border-radius: 50% 50%;
    border: 2px solid #dc8f03;
  }
  .inner {
    width: 45px;
    height: 90px;
    background: #d8000f;
    background: rgba(216, 0, 15, 0.1);
    margin: -4px 8px 8px 26px;
    border-radius: 50% 50%;
    border: 2px solid #dc8f03;
  }
  .line {
    position: absolute;
    top: -200px;
    bottom: 100%;
    left: 60px;
    width: 2px;
    background: #dc8f03;
  }
  .ears {
    position: relative;
    width: 5px;
    height: 20px;
    margin: -5px 0 0 59px;
    //animation: swing 4s infinite ease-in-out;
    transform-origin: 50% -45px;
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
    font-family: 华文行楷, Arial, Lucida Grande, Tahoma, sans-serif;
    font-size: 3.2rem;
    color: #dc8f03;
    font-weight: bold;
    line-height: 85px;
    text-align: center;
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
