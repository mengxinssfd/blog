<template>
  <div class="c-index-banner" :class="{ 'no-bg': !bgImg, blur }" :style="{ height }">
    <div class="banner-bg _ wh-p100" :style="bannerStyle">
      <!--      <img
        class="bg _ wh-p100"
        :src="bgImg || TODAY_COVER_URL"
        alt=""
        loading="lazy"
        :onerror="`this.src='${TODAY_COVER_URL}'`"
      />-->
      <img
        class="bg _ wh-p100"
        :src="activeImageUrl"
        alt=""
        loading="lazy"
        :onerror="`this.src='${TODAY_COVER_URL}'`" />
    </div>
    <div class="shaders">
      <div class="topLeft"></div>
      <div class="topRight"></div>
      <div class="bottom"></div>
    </div>
    <div class="banner-content _ w-p100 h-p100 abs-tl">
      <slot name="content">
        <h1
          class="content-text _ w-p100 h-p100 flex-c-c"
          :style="{
            background: `url(${activeImageUrl})`,
            'background-attachment': 'fixed',
            'background-size': 'cover',
            'background-position': 'center',
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
          }">
          <strong>MATTER OF TIME</strong>
        </h1>
      </slot>
    </div>
    <div class="img-operation _ flex-c main-width">
      <div class="info">{{ activeImagesItem?.title }}</div>
      <div class="pages _ flex-c">
        <div
          class="_ btn flex-c-c prev"
          :class="{ disabled: images.activeIndex === images.list.length - 1 }"
          @click="images.activeIndex++">
          <el-icon :size="20">
            <ArrowLeft />
          </el-icon>
        </div>
        <div
          class="_ btn flex-c-c next"
          :class="{ disabled: images.activeIndex === 0 }"
          @click="images.activeIndex--">
          <el-icon :size="20">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { randomInt } from '@tool-pack/basic';
import { ArrowRight, ArrowLeft } from '@element-plus/icons-vue';
import { DailyImg, getDailyImg } from '@blog/apis';
import { computed, defineComponent, onMounted, onUnmounted, reactive } from '#imports';
import { useAsyncData } from '#app';
import { useBanner } from '~/feature/hooks';
import { TODAY_COVER_URL } from '~/config/constants';

export default defineComponent({
  compatConfig: {
    INSTANCE_ATTRS_CLASS_STYLE: true,
  },
  components: { ArrowLeft, ArrowRight },
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
      images: reactive({
        list: [] as DailyImg[],
        activeIndex: 0,
      }),
    };
    const Computed = {
      activeImagesItem: computed((): DailyImg | null => {
        const { list, activeIndex } = Data.images;
        if (!list.length) return null;
        return list[activeIndex];
      }),
      activeImageUrl: computed((): string => {
        const obj = Computed.activeImagesItem.value;
        if (!obj) return TODAY_COVER_URL;
        return 'https://s.cn.bing.net' + obj.url;
      }),
    };
    const Methods = {
      async getDailyImg() {
        const { data } = await useAsyncData(async () => await getDailyImg());
        Data.images.list = data.value?.data.images || [];
      },
      watchKeyDown(e: KeyboardEvent) {
        const images = Data.images;
        const map = {
          ArrowLeft: () => images.activeIndex < images.list.length - 1 && images.activeIndex++,
          ArrowRight: () => images.activeIndex > 0 && images.activeIndex--,
        };
        map[e.code as keyof typeof map]?.();
      },
    };

    function init() {
      props.scroll && useBannerScrollWatch();
      onMounted(() => window.addEventListener('keydown', Methods.watchKeyDown));
      onUnmounted(() => window.removeEventListener('keydown', Methods.watchKeyDown));
    }

    onMounted(init);

    // await Methods.getDailyImg();
    return {
      ...Data,
      ...Computed,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-index-banner {
  position: relative;
  @media (max-width: 750px) {
    //height: 50vw !important;
  }
  @media (max-width: 600px) {
    //height: 70vw !important;
    display: none;
  }
  .img-operation {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    margin: auto;
    justify-content: flex-end;
    .info {
      padding: 0 10px;
      height: 42px;
      line-height: 42px;
      border: 2px;
      font-size: 14px;
      color: white;
      background: rgba(34, 34, 34, 0.8);
    }
    .pages {
      margin-left: 6px;
      > div {
        background: rgba(34, 34, 34, 0.8);
        width: 42px;
        height: 42px;
        border-radius: 2px;
        color: white;
        &:hover {
          background: rgba(34, 34, 34, 1);
        }
        &.disabled {
          color: #949494;
          pointer-events: none;
        }
      }
      .next {
        margin-left: 6px;
      }
    }
  }
  .shaders {
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    .topLeft,
    .topRight,
    .bottom {
      height: 28%;
      position: absolute;
    }
    .topLeft {
      left: 0;
      width: 100%;
      background: linear-gradient(to bottom left, rgba(0, 0, 0, 0.5) -20%, transparent 30%);
    }
    .topRight {
      right: 0;
      width: 100%;
      background: linear-gradient(to bottom right, rgba(0, 0, 0, 0.5) -20%, transparent 30%);
    }
    .bottom {
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
      bottom: 0;
      left: 0;
      width: 100%;
    }
  }
  .banner-bg {
    overflow: hidden;
    img.bg {
      display: block;
      object-fit: cover;
      transform-origin: center;
    }
  }
  .banner-content {
    width: 100%;
    color: var(--navbar-text-color);
    .content-text {
      text-align: center;
      //margin-bottom: 100px;
      font-weight: bold;
      color: #f8e8aa;
      //text-shadow: 3px 3px black;
      //background: linear-gradient(90deg, #fdf5f1 0%, #f8e8aa 100%);
      //-webkit-background-clip: text;
      //-webkit-text-fill-color: transparent;
      strong {
        margin-right: 20px;
        font-size: 80px;
        font-family: fantasy, monospace, cursive;
        letter-spacing: 6px;
      }
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
