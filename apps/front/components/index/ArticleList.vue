<template>
  <section ref="contentRef" class="content board main-width flex-c">
    <section class="filters">
      <IndexFilters />
    </section>
    <section class="list">
      <template v-if="article.list.length">
        <IndexCard
          v-for="(item, i) in article.list"
          :key="item.id"
          :reverse="i % 2 !== 0"
          :item="item"
          @update-like="updateLike(item, $event)"></IndexCard>
      </template>
      <el-empty v-else description="暂无数据" />
    </section>
    <section class="pagination _ flex-c-c">
      <el-pagination
        v-if="false"
        v-model:currentPage="page.current"
        background
        layout="prev, pager, next"
        :page-size="page.size"
        :total="article.count"
        @current-change="onPageChange">
      </el-pagination>
      <SsrPagination
        v-if="article.count"
        :page="page.current"
        :size="page.size"
        :total="article.count" />
    </section>
  </section>
</template>

<script lang="ts">
import { getArticleList, type GetArticleListRes } from '@blog/apis';
import { filterObj } from '@tool-pack/basic';
import type { ArticleListDto } from '@blog/dtos';

definePageMeta({
  // alias: '/',
});

export default defineComponent({
  async setup() {
    const route = useRoute();
    const _Methods = {
      getDataByRoute() {
        const q = route.query;
        const data: ArticleListDto = {
          keyword: q.query as string,
          sort: q.sort ? Number(q.sort) : 3,
          category: Number(q.cate),
          tags: ((q.tag as string) || '').split(',').filter(Boolean).map(Number),
          page: q.page ? Number(q.page) : 1,
          pageSize: 10,
        };
        const nullable = [undefined, NaN, null];
        return filterObj(data, (v) => !nullable.includes(v));
      },
    };
    const Data = {
      article: reactive<GetArticleListRes>({ list: [], count: 0 }),
      contentRef: ref<HTMLDivElement>(),
      scrollTop: ref(0),
      dateTime: ref('0'),
      page: reactive({ size: 10, current: 1 }),
    };

    const Methods = {
      refreshData() {},
      backTop() {
        // scrollTo((Data.contentRef.value?.offsetTop ?? 741) - 60, 30);
        document.body.scrollIntoView({ block: 'start' /* , behavior: 'smooth' */ });
      },
      onPageChange() {
        Methods.backTop();
        navigateTo({ path: '/' + Data.page.current, query: route.query });
      },
      async getArticleListData() {
        const { data, refresh } = await useAsyncData(() => {
          const data = _Methods.getDataByRoute();
          return getArticleList(data, !process.server);
        });
        Methods.refreshData = refresh;
        Data.article.list = data.value?.data.list || [];
        Data.article.count = data.value?.data.count || 0;
      },
      updateLike(item: any, data: any) {
        item.like = data;
      },
    };

    onMounted(() => {
      // Methods.refreshData();
      watch(route, () => {
        Methods.backTop();
        Methods.getArticleListData();
      });
    });

    await Methods.getArticleListData();

    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.pg.index {
  position: relative;
  display: block;
  margin: 0 !important;
  font-size: 0;
  .text-block {
    width: 100%;
    color: white;
    .welcome {
      font-size: 50px;
      text-align: center;
      text-shadow: 3px 3px black;
    }
    .arrow {
      margin: 60px auto 0;
      font-size: 50px;
      height: 1em;
      width: 1em;
      animation: heart-beat 1.5s infinite;
      &:after {
        display: inline-block;
        transform: rotate(90deg);
        content: '〉';
      }
    }
  }
  .svg-mountain {
    width: 100%;
    height: 100vh;
  }
  section {
    &.transition-bg {
      position: absolute;
      top: 100vh;
      bottom: -100px;
      left: 0;
      width: 100%;
      background: linear-gradient(#161329, var(--body-bg-color));
    }
    &.content {
      position: relative;
      > .filters,
      > .list,
      > .pagination {
        position: relative;
        margin-top: 1rem;
        font-size: 1rem;
      }
      > .filters {
        margin-top: 0;
        z-index: 5;
        //margin-top: -70px;
        //min-height: 150px;
        border-radius: 10px 10px 0 0;
        > div {
          + div {
            margin-top: 20px;
          }
          .label {
            position: relative;
            margin-right: 10px;
            font-weight: bold;
            height: 28px;
            color: var(--text-color);
            &:before {
              display: inline-block;
              vertical-align: top;
              margin-right: 10px;
              height: 1em;
              width: 3px;
              background-color: #409eff;
              content: '';
            }
          }
          .select {
            flex: 1;
          }
        }
      }
      > .list {
        position: relative;
        padding-bottom: 0;
      }
      > .pagination {
        text-align: center;
        border-radius: 0 0 10px 10px;
        i {
          display: inline-block;
        }
      }
    }
  }
}
</style>
