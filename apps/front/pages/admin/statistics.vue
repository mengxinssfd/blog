<template>
  <div class="pg statistics">
    <section v-if="total.user" class="total">
      <section class="user">
        <h2>账号</h2>
        <ul>
          <li>
            <span class="name">总数</span>
            <span class="value">{{ total.user.total }}</span>
          </li>
          <li>
            <span class="name">有效账号</span>
            <span class="value">{{ total.user.valid }}</span>
          </li>
          <li>
            <span class="name">无效账号</span>
            <span class="value">{{ total.user.invalid }}</span>
          </li>
          <li>
            <span class="name">已删除账号</span>
            <span class="value">{{ total.user.delete }}</span>
          </li>
        </ul>
      </section>
      <section class="article">
        <h2>文章</h2>
        <ul>
          <li>
            <span class="name">总数</span>
            <span class="value">{{ total.article.total }}</span>
          </li>
          <li>
            <span class="name">有效文章</span>
            <span class="value">{{ total.article.public }}</span>
          </li>
          <li>
            <span class="name">已删除文章</span>
            <span class="value">{{ total.article.delete }}</span>
          </li>
          <li>
            <span class="name">非公开文章</span>
            <span class="value">{{ total.article.private }}</span>
          </li>
          <li>
            <span class="name">文章浏览总数</span>
            <span class="value">{{ total.article.viewCount }}</span>
          </li>
        </ul>
      </section>
      <section class="article-like">
        <h2>文章点赞</h2>
        <ul>
          <li>
            <span class="name">总数</span>
            <span class="value">{{ total.articleLike.total }}</span>
          </li>
          <li>
            <span class="name">有效点赞</span>
            <span class="value">{{ total.articleLike.common }}</span>
          </li>
          <li>
            <span class="name">已删除点赞</span>
            <span class="value">{{ total.articleLike.delete }}</span>
          </li>
        </ul>
      </section>
      <section class="comment">
        <h2>文章评论</h2>
        <ul>
          <li>
            <span class="name">总数</span>
            <span class="value">{{ total.comment.total }}</span>
          </li>
          <li>
            <span class="name">有效文章评论</span>
            <span class="value">{{ total.comment.common }}</span>
          </li>
          <li>
            <span class="name">已删除文章评论</span>
            <span class="value">{{ total.comment.delete }}</span>
          </li>
        </ul>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getStatisticsTotal as getStatisticsTotalApi, StatisticsTotal } from '@blog/apis';
import { useRouter } from '#app';
import useUserStore from '~/store/user.store';

const router = useRouter();

const total = ref<StatisticsTotal>({} as any);

const loginUser = computed(() => useUserStore().user);

async function getStatisticsTotal() {
  const res = await getStatisticsTotalApi();
  total.value = res.data;
}

watch(
  loginUser,
  (n) => {
    if (n.role !== 0) router.back();
  },
  { immediate: true },
);

getStatisticsTotal();
</script>
<style lang="scss">
.pg.statistics {
  > section {
    position: relative;
    margin-top: -20px;
    padding: 20px;
    &.total {
      section {
        + section {
          margin-top: 20px;
        }
        span {
          margin-right: 10px;
          &.name {
            display: inline-block;
            width: 120px;
          }
        }
      }
    }
  }
}
</style>
