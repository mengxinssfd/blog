<template>
  <NuxtLink :to="detailUrl" class="c-card">
    <div class="cover-block img-box">
      <img
        :src="item?.cover || TODAY_COVER_URL"
        alt=""
        loading="lazy"
        :onerror="`this.src='${TODAY_COVER_URL}'`" />
    </div>
    <div class="content-block _ flex-col-evenly">
      <h1 class="title">
        {{ item.title }}
      </h1>
      <div class="time">
        <div class="create-at">
          <i class="iconfont icon-create-at"></i>{{ relativeTime(item.createAt) }}
        </div>
        <div class="update-at">
          <i class="iconfont icon-update-at"></i>{{ relativeTime(item.updateAt) }}
        </div>
      </div>
      <div class="cate-tag _ flex-c">
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
      <p class="desc _ ellipsis-1">{{ item.description }}</p>

      <div class="bottom _ flex-c-between">
        <div class="author _ flex-c">
          <div class="author-name _ ellipsis-1" @click.stop.prevent="toUser(item)">
            <i class="iconfont icon-user"></i>{{ item.author.nickname }}
          </div>
        </div>

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
  },
  emits: ['updateLike'],
  setup(props, ctx) {
    const router = useRouter();
    const Data = {
      detailUrl: '/article/detail/' + props.item.id,
      randCoverColor: RGB.random(),
      tagColors: ['', 'success', 'info', 'warning', 'danger'],
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
  margin-bottom: 20px;
  border-radius: 10px;
  padding: 0;
  text-decoration: none;
  transition: transform 0.3s;
  color: #4e5969;
  @media (min-width: 780px) {
    display: inline-block;
    vertical-align: top;
    width: 49%;
    &:nth-child(even) {
      margin-left: 2%;
    }
  }
  &:hover {
    transform: translateZ(0);
    //box-shadow: 0 0 16px 16px rgba(0, 0, 0, 0.06);
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.66));
    .img-box img {
      filter: saturate(1.75);
    }
  }
  .cover-block {
    height: 286px;
    overflow: hidden;
    filter: brightness(0.99);
    background: #fcfcfc;
    border-radius: 10px 10px 0 0;
    .empty-cover {
      width: 100%;
      height: 100%;
    }
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
      .time {
        span {
          margin-right: 8px;
        }
      }
      div {
        + div {
          margin-left: 6px;
          padding-left: 6px;
          border-left: 1px solid #e5e6eb;
        }
      }
    }
    .time {
      display: flex;
      align-items: center;
      font-size: 12px;
      line-height: 1em;
      color: var(--sec-text-color);
      font-family: 'Rubik', sans-serif;
      > div {
        margin-right: 6px;
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
      line-height: 1em;
      color: var(--text-color);
    }
    .desc {
      color: var(--text-color);
      font-size: 12px;
      line-height: 22px;
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
  @media (max-width: 992px) {
    .left {
      flex: 0 0 200px;
    }
    .right {
      .author-name {
        max-width: 50px;
      }
    }
  }
  @media (max-width: 767px) {
    display: block !important;
    .left {
      width: 100%;
      //height: auto;
      margin-bottom: 20px;
    }
    .right {
      height: 130px;
    }
  }
  @media (max-width: 500px) {
    .right {
      .time {
        display: block;
        .update-at {
          margin: 2px 0 0;
          padding: 0;
          border: 0;
        }
      }
    }
  }
}
</style>
