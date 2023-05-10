<template>
  <div
    class="c-banner"
    :class="{ 'no-bg': !bgImg, blur }"
    :style="{
      height,
    }">
    <div class="banner-bg _ wh-p100" :style="bannerStyle">
      <slot name="bg" :style="{ filter: filterValue }">
        <img
          class="bg _ wh-p100"
          :style="{ filter: filterValue }"
          :src="bgImg || TODAY_COVER_URL"
          alt=""
          loading="lazy"
          :onerror="`this.src='${TODAY_COVER_URL}'`" />
        <!--<div v-else class="bg _ wh-p100" :style="{ background: bgColor }" :class="bgClass"></div>-->
      </slot>
    </div>
    <div class="banner-content _ pos-trans-c-c" :class="`header-mode-${headerMode}`">
      <slot name="content">
        <h1 class="content-text">{{ content }}</h1>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { randomInt } from '@tool-pack/basic';
import { useBanner } from '~/feature/hooks';
import { TODAY_COVER_URL } from '@/config/constants';
import useHeaderStore from '~/store/header.store';

export default defineComponent({
  compatConfig: {
    INSTANCE_ATTRS_CLASS_STYLE: true,
  },
  components: {},
  props: {
    // 有slot用slot，无slot有bgImg用bgImg，否则用bgColor
    bgImg: { type: String, default: '' },
    bgColor: { type: String, default: 'var(--navbar-bg-color)' },
    height: {
      type: String,
      default: '100vh',
    },
    content: {
      type: String,
      default: '',
    },
    blur: {
      type: Boolean,
      default: true,
    },
    brightness: {
      type: [Boolean, Number],
      default: false,
    },
    scroll: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const [bannerStyle, useBannerScrollWatch] = useBanner();
    const headderStore = useHeaderStore();
    const Data = {
      bgClass: 'color-' + randomInt(1, 4),
      bannerStyle,
      TODAY_COVER_URL,
    };
    const Computed = {
      filterValue: computed(() =>
        props.brightness
          ? `brightness(${props.brightness === true ? 0.35 : props.brightness})`
          : '',
      ),
      headerMode: computed(() => headderStore.mode),
    };
    const Methods = {};

    function init() {
      props.scroll && useBannerScrollWatch();
    }

    onMounted(init);
    return {
      ...Data,
      ...Computed,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-banner {
  margin-top: calc(var(--header-height) * -1);
  position: relative;
  @media (max-width: 750px) {
    height: 50vw !important;
  }
  @media (max-width: 600px) {
    height: 70vw !important;
  }
  .banner-bg {
    overflow: hidden;
    img.bg {
      display: block;
      object-fit: cover;
      //transform: scale(1.3, 1.3);
      transform-origin: center;
    }
    div.bg {
      &.color-1 {
        background: #ee3c6d;
      }
      &.color-2 {
        background: #9641f6;
      }
      &.color-3 {
        background: #7da5ed;
      }
      &.color-4 {
        background: #c2f083;
      }
    }
  }
  .banner-content {
    margin-top: calc(var(--header-height) * 0.5);
    //width: 100%;
    color: var(--navbar-text-color);
    text-align: center;
    z-index: 2;
    transition: margin-top 0.2s linear;
    &:before,
    &:after {
      position: absolute;
      top: 50%;
      height: 100%;
      //min-height: 60px;
      width: 100px;
      background: url('https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/1231112321%20(1).png')
        no-repeat center;
      background-size: contain;
      filter: invert(0.85) drop-shadow(2px 4px 6px white);
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
    &.header-mode-transparent {
      margin-top: 0;
    }
    .content-text {
      font-size: 36px;
    }
    @media (max-width: 750px) {
      top: unset;
      bottom: 0;
      left: 0;
      padding: 1rem;
      margin-top: 0;
      width: 100%;
      transform: none;
      text-align: left;
      &:before,
      &:after {
        display: none;
      }
    }
  }
  &.no-bg {
    .banner-content {
      color: var(--text-color);
    }
  }
  &.blur {
    .banner-content {
      color: var(--text-color);
    }
    &:before {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: var(--navbar-bg-color);
      backdrop-filter: saturate(10) blur(20px);
      z-index: 1;
      content: '';
    }
  }
  .page-title {
    font-size: 40px;
    font-weight: bolder;
    word-break: keep-all;
  }
}
</style>
