<template>
  <div class="c-banner" :class="{ 'no-bg': !bgImg, blur: blur }" :style="{ height }">
    <div class="banner-bg _ wh-p100" :style="bannerStyle">
      <slot name="bg">
        <img
          class="bg _ wh-p100"
          :src="bgImg || TODAY_COVER_URL"
          alt=""
          loading="lazy"
          :onerror="`this.src='${TODAY_COVER_URL}'`" />
        <!--<div v-else class="bg _ wh-p100" :style="{ background: bgColor }" :class="bgClass"></div>-->
      </slot>
    </div>
    <div class="banner-content _ pos-trans-c-c">
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
    scroll: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const [bannerStyle, useBannerScrollWatch] = useBanner();
    const Data = {
      bgClass: 'color-' + randomInt(1, 4),
      bannerStyle,
      TODAY_COVER_URL,
    };
    const Computed = {};
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
      transform: scale(1.3, 1.3);
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
    width: 100%;
    color: var(--navbar-text-color);
    .content-text {
      font-size: 36px;
      text-align: center;
    }
  }
  &.no-bg {
    .banner-content {
      color: var(--text-color);
    }
  }
  &.blur {
    img.bg {
      filter: blur(30px) brightness(0.9);
    }
  }
}
.theme-dark {
  .c-banner.blur {
    img.bg {
      filter: blur(30px) brightness(0.7);
    }
  }
}
</style>
