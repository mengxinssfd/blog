<template>
  <div class="fixed-banner-layout">
    <slot name="banner"></slot>
    <div class="main-wrapper main-width">
      <section class="title-block board frosted-glass-bg">
        <div class="title-box">
          <slot name="title"></slot>
        </div>
      </section>
      <main class="_ flex flex-1">
        <slot />
        <!-- <Aside><slot name="aside"></slot></Aside> -->
      </main>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
@import '@/styles/scss.variable.scss';
.fixed-banner-layout {
  .c-banner {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0 !important;
    height: 100vh !important;
    @media (max-width: 750px) {
      height: 100vh;
    }
  }
  main {
    overflow-x: hidden;
  }
  .title-block {
    margin: 18vmin 0;
    padding: 3rem 0;
    text-align: center;
    .page-title {
      font-size: 40px;
      font-weight: bolder;
      word-break: keep-all;
      word-wrap: break-word;
    }
    .title-box {
      display: inline-block;
      position: relative;
      &:before,
      &:after {
        position: absolute;
        top: 50%;
        height: 100%;
        //min-height: 60px;
        width: 100px;
        background: url(https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/1683744195365.png)
          no-repeat center;
        background-size: contain;
        filter: invert(1) drop-shadow(2px 4px 6px white);
        content: '';
      }
      &:before {
        transform: translateY(-50%);
        left: -80px;
      }
      &:after {
        right: -80px;
        transform: scaleX(-1) translateY(-50%);
      }
    }
  }
  .c-aside {
    @media (max-width: $show-aside-on-screen-width) {
      display: none;
    }
  }
}
</style>
