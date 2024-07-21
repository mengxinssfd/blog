<script setup lang="ts">
import type { ArticleEntity } from '@blog/entities';
import { groupBy } from '@tool-pack/basic';
import type { ChangeLog } from '~/types';

interface LogItem extends ChangeLog {
  _date: Date;
}
type DateGroup = [date: string, list: LogItem[]];
type MonthGroup = [month: string, data: { list: DateGroup[]; total: number }];
type YearGroup = [year: string, data: { list: MonthGroup[]; total: number }];

const article = ref<ArticleEntity>({} as ArticleEntity);
const contentRef = ref<HTMLElement>();
const collapseValue = ref<string[]>([]);
const changelog = ref<YearGroup[]>([]);

function forEachObjWithSortedKey<T extends object>(
  obj: T,
  cb: (v: T[keyof T], k: keyof T) => void,
) {
  const keys = Object.keys(obj) as (keyof T)[];
  keys.sort((a, b) => Number(b) - Number(a));
  keys.forEach((k) => cb(obj[k], k));
}

onMounted(async () => {
  const changeLogJson = await fetch(`/changelog.json`).then(
    (res) => res.json() as Promise<ChangeLog[]>,
  );
  if (!changeLogJson) return;

  const yearGroupObj = groupBy(
    changeLogJson.map((i) => ({ ...i, _date: new Date(i.date) })) as LogItem[],
    (v) => String(v._date.getFullYear()),
  ) as Record<string, LogItem[]>;

  const res: YearGroup[] = [];
  forEachObjWithSortedKey(yearGroupObj, (v, k) => {
    const monthGroupObj = groupBy(v, (v) => String(v._date.getMonth() + 1)) as Record<
      string,
      LogItem[]
    >;
    const monthGroup: MonthGroup[] = [];
    forEachObjWithSortedKey(monthGroupObj, (v, k) => {
      const dateGroupObj = groupBy(v, (v) => String(v._date.getDate())) as Record<
        string,
        LogItem[]
      >;
      const dateGroup: DateGroup[] = [];
      forEachObjWithSortedKey(dateGroupObj, (v, k) => {
        dateGroup.push([k, v]);
      });
      monthGroup.push([k, { list: dateGroup, total: v.length }]);
    });
    res.push([k, { list: monthGroup, total: v.length }]);
  });

  if (res.length) {
    changelog.value = res;
    collapseValue.value.push(res[0][0]);
  }
});
</script>

<template>
  <ArticleAsPage as="changelog" @data="article = $event">
    <template #aside>
      <Widget v-if="article?.content && article.content !== '<p>无</p>\n'" class="notice-widget">
        <div class="record-widget-content" v-html="article.content"></div>
      </Widget>
      <WidgetStickyLayout>
        <WidgetArticleTOC v-if="changelog.length" :reference="contentRef" />
      </WidgetStickyLayout>
    </template>
    <section ref="contentRef" class="project-list-area board">
      <el-collapse v-model="collapseValue" class="year-group">
        <el-collapse-item v-for="year in changelog" :key="year[0]" :name="year[0]">
          <template #title>
            <h1 :id="`year-${year[0]}`">
              {{ year[0] }}年 <span class="total">({{ year[1].total }})</span>
            </h1>
          </template>
          <ul class="month-group">
            <li v-for="month in year[1].list" :key="month[0]">
              <h2 :id="`year-${year[0]}-${month[0]}`">
                {{ month[0] }}月 <span class="total">({{ month[1].total }})</span>
              </h2>
              <ul class="date-group">
                <li v-for="date in month[1].list" :key="date[0]">
                  <el-tag type="primary" effect="plain" round> {{ date[0] }}日</el-tag>
                  <ul class="date-list">
                    <li v-for="log in date[1]" :key="log.date">
                      <div>
                        <el-tag v-if="log.type" type="success">{{ log.type }}</el-tag>
                        <el-tag v-if="log.scope" type="info">{{ log.scope }}</el-tag>
                        <span>
                          {{ log.title }}
                        </span>
                      </div>
                      <div v-if="log.desc" class="desc">
                        {{ log.desc }}
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
      <el-empty v-if="!changelog.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
</template>

<style lang="scss" scoped>
.year-group {
  --el-collapse-border-color: rgba(0, 0, 0, 0);
  :deep {
    .el-collapse-item + .el-collapse-item {
      margin-top: 1rem;
    }
    .el-collapse-item__header {
      position: relative;
      padding: 0 0 0 1rem;
      $h: 30px;
      height: $h;
      line-height: $h;
      font-size: 1.2rem;
      h1 {
        font-weight: bolder;
        + span {
          margin-left: 6px;
          font-size: 1rem;
        }
      }
      &:before {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: var(--theme-color);
        content: '';
      }
    }
    .el-collapse-item__content {
      padding: 1rem 0;
    }
  }
  ul {
    list-style: square;
  }
  ol {
    list-style: decimal;
  }
  ul,
  ol,
  li {
    padding: revert;
    white-space: pre-wrap;
    font-size: 1rem;
  }
  h2 {
    font-size: 1.2rem;
  }
  .total {
    font-size: 0.9rem;
  }
  .desc {
    margin-left: 0.5rem;
  }
}
</style>
