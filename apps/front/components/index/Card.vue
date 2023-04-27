<template>
  <NuxtLink :to="detailUrl" class="c-card _ flex-c" :class="{ reverse }">
    <div class="cover-block before-cover _ img-box">
      <img
        :src="item?.cover || TODAY_COVER_URL"
        alt=""
        loading="lazy"
        :onerror="`this.src='${TODAY_COVER_URL}'`" />
    </div>
    <div class="content-block _ flex-col-evenly">
      <h1 class="title _ ellipsis-2">
        {{ item.title }}
      </h1>
      <div class="info _ flex-c">
        <div class="author _ flex-c">
          <div class="author-name _ ellipsis-1" @click.stop.prevent="toUser(item)">
            <i class="iconfont icon-user"></i>{{ item.author.nickname }}
          </div>
        </div>
        <div class="create-at">
          <i class="iconfont icon-create-at"></i>
          发布于{{ relativeTime(item.createAt) }}
        </div>
        <div class="update-at">
          <i class="iconfont icon-update-at"></i>
          更新于{{ relativeTime(item.updateAt) }}
        </div>
        <div class="category _ flex-c">
          <i class="iconfont icon-category"></i>{{ item.category?.name }}
        </div>
        <div class="tags _ flex-c">
          <i class="iconfont icon-tag"></i>
          <span v-for="it in item?.tags || []" :key="it.id">
            {{ it.name }}
          </span>
        </div>
      </div>
      <p class="desc _ ellipsis-2">{{ item.description }}</p>

      <div class="bottom _ flex-c-between">
        <div class="operate _ flex-c">
          <div class="view">
            <i class="iconfont icon-view"></i>
            <span class="text">{{ item.viewCount }}</span>
          </div>
          <div class="like" @click.stop.prevent="setLike">
            <i class="iconfont" :class="item?.like.checked ? 'icon-like2' : 'icon-like1'"></i>
            <span class="text">{{ item.like.count || 0 }}</span>
          </div>
          <div class="comment">
            <i class="iconfont icon-huifu"></i>
            <span class="text">{{ item.commentCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="cover-block after-cover _ img-box">
      <img
        :src="item?.cover || TODAY_COVER_URL"
        alt=""
        loading="lazy"
        :onerror="`this.src='${TODAY_COVER_URL}'`" />
    </div>
  </NuxtLink>
</template>

<script lang="ts">
import { RGB } from '@tool-pack/basic';
import { ArticleEntity } from '@blog/entities';
import { setArticleLike } from '@blog/apis';
import type * as Vue from 'vue';
import { useRouter } from '#app';
import { howLongAgo } from '~/feature/utils';
import { TODAY_COVER_URL } from '~/config/constants';

export default defineComponent({
  props: {
    item: {
      type: Object as Vue.PropType<ArticleEntity>,
      default() {
        return {
          author: {},
          like: {},
          category: {},
        };
      },
    },
    reverse: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['updateLike'],
  setup(props, ctx) {
    const router = useRouter();
    const Data = {
      detailUrl: '/article/detail/' + props.item.id,
      randCoverColor: RGB.random(),
      TODAY_COVER_URL,
    };
    const Methods = {
      relativeTime(time: string | Date) {
        return howLongAgo(time, 'yyyy-MM-dd hh:mm');
      },
      async setLike() {
        const res = await setArticleLike(props.item.id);
        ctx.emit('updateLike', res.data);
      },
      toUser(item: ArticleEntity | undefined) {
        if (!item) return '';
        router.push('/user/info/' + item.author.id);
      },
    };
    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-card {
  display: block;
  box-shadow: 0 0 8px 8px rgba(0, 0, 0, 0.015);
  margin-bottom: 1rem;
  border-radius: 10px;
  text-decoration: none;
  transition: transform 0.3s;
  color: #4e5969;
  &:hover {
    position: relative;
    //transform: translateZ(0);
    box-shadow: 0 0 16px 16px rgba(0, 0, 0, 0.06);
    //filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.66));
    transform: translateY(-12px);
    .img-box img {
      filter: saturate(1.75);
    }
  }
  .cover-block {
    height: 238px;
    width: 238px;
    overflow: hidden;
    filter: brightness(0.99);
    background: #fcfcfc;
    border-radius: 10px 0 0 10px;
    transition: width 0.3s linear;
  }
  .content-block {
    flex: 1;
    overflow: hidden;
    height: 186px;
    padding: 0 20px;
    .author {
      font-size: 12px;
      line-height: 1em;
      color: var(--sec-text-color);
      .iconfont {
        font-size: 12px;
      }
      div {
        + div {
          margin-left: 6px;
          padding-left: 6px;
          border-left: 1px solid #e5e6eb;
        }
      }
    }
    .info {
      flex-wrap: wrap;
      margin: -6px;
      font-size: 12px;
      line-height: 1em;
      color: var(--sec-text-color);
      span {
        margin-right: 8px;
      }
      > div {
        margin: 6px;
      }
      i {
        font-size: 0.99em;
      }
    }
    .iconfont {
      margin-right: 4px;
    }
    .tags,
    .category {
      font-size: 12px;
      color: var(--sec-text-color);
    }
    .tags {
      margin-left: 8px;
      span {
        margin-right: 6px;
      }
    }
    .title {
      align-items: baseline;
      font-weight: 700;
      font-size: 22px;
      line-height: 1.6em;
      color: var(--text-color);
    }
    .desc {
      color: var(--text-color);
      font-size: 12px;
    }
    .operate {
      font-size: 12px;
      line-height: 1em;
      color: var(--sec-text-color);
      > div {
        display: flex;
        align-items: center;
        margin-right: 8px;
      }
      .comment {
        i {
          font-size: 0.99em;
        }
      }
      .like {
        cursor: pointer;
        &:hover {
          color: #409eff;
        }
      }
    }
  }
  .after-cover {
    display: none;
    border-radius: 0 10px 10px 0;
  }

  &.reverse {
    .before-cover {
      display: none;
    }
    .after-cover {
      display: block;
    }
  }
  @media (max-width: 750px) {
    display: block !important;
    box-shadow: none;
    .before-cover {
      display: block !important;
      width: 100%;
      border-radius: 0 !important;
    }
    .after-cover {
      display: none !important;
    }
    &:hover {
      box-shadow: none;
      transform: none;
    }
  }
}
</style>
