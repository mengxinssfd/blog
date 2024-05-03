<template>
  <div class="c-index-filters">
    <div class="operation _ flex-c">
      <client-only>
        <!--  排序  -->
        <el-dropdown @command="searchData.sort = $event">
          <div>
            排序
            <el-tag
              :closable="searchData.sort !== 3"
              disable-transitions
              @close="searchData.sort = 3">
              {{ activeSort?.label }}
            </el-tag>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in sort"
                :key="item.value"
                :disabled="searchData.sort === item.value"
                :command="item.value">
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!--  分类  -->
        <el-dropdown @command="searchData.category = $event">
          <div>
            分类
            <el-tag
              :closable="searchData.category !== 0"
              disable-transitions
              @close="searchData.category = 0">
              {{ activeCate?.name }}
            </el-tag>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in categories"
                :key="item.id"
                :disabled="searchData.category === item.id"
                :command="item.id">
                {{ item.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!--  标签  -->
        <div class="tag">
          <el-popover :width="400" trigger="hover">
            <template #reference>
              <div>
                <span>标签</span>
                <el-tag
                  v-for="tag in activeTags"
                  :key="tag.id"
                  :closable="getResultTagClosable(tag)"
                  disable-transitions
                  @close="handleResultTagClick(tag)">
                  {{ tag.name }}
                </el-tag>
              </div>
            </template>
            <div class="pop-content">
              <div class="search-box">
                <el-input v-model="filterTag" placeholder="筛选标签" clearable>
                  <template #prefix>
                    <el-icon size="20">
                      <Search></Search>
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <div class="tags-wrapper">
                <el-tag
                  v-for="tag in filterTags"
                  :key="tag.id"
                  :effect="searchData.tags.includes(tag.id) ? 'dark' : 'light'"
                  disable-transitions
                  @click="handleTagClick(tag)">
                  {{ tag.name }}
                </el-tag>
              </div>
              <div class="pop-bottom">
                <el-button text @click="searchData.tags = []">
                  <el-icon><RefreshLeft /></el-icon>重置
                </el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </client-only>
    </div>
  </div>
</template>

<script lang="ts">
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import { debounce } from '@tool-pack/basic';
import { getTags, getCategoryList } from '@blog/apis';
import type { CategoryEntity, TagEntity } from '@blog/entities';
import * as Vue from 'vue';

interface ResultTag {
  name: string;
  id: number;
  type?: string;
}
interface Sort {
  label: string;
  value: number;
}

export default defineComponent({
  components: {
    Search,
    RefreshLeft,
  },
  async setup() {
    const route = useRoute();
    const Data = {
      sort: [
        {
          label: '创建时间 升序',
          value: 0,
        },
        {
          label: '创建时间 降序',
          value: 1,
        },
        {
          label: '更新时间 升序',
          value: 2,
        },
        {
          label: '更新时间 降序',
          value: 3,
        },
        {
          label: '查看数 升序',
          value: 4,
        },
        {
          label: '查看数 降序',
          value: 5,
        },
        {
          label: '点赞数 升序',
          value: 6,
        },
        {
          label: '点赞数 降序',
          value: 7,
        },
        /* {
          label: '评论数 升序',
          value: 8,
        },
        {
          label: '评论数 降序',
          value: 9,
        }, */
      ] as Sort[],
      categories: ref<CategoryEntity[]>([]),
      tags: ref<TagEntity[]>([]),
      searchData: reactive({
        keyword: route.query.query || '',
        tags: [] as TagEntity['id'][],
        sort: 3,
        category: 0,
      }),
      filterTag: ref(''),
      tagsMap: {} as Record<number, TagEntity>,
    };
    const Computed: {
      filterTags: Vue.ComputedRef<TagEntity[]>;
      activeSort: Vue.ComputedRef<Sort | undefined>;
      activeCate: Vue.ComputedRef<CategoryEntity | undefined>;
      activeTags: Vue.ComputedRef<TagEntity[]>;
      resultTag: Vue.ComputedRef<Array<ResultTag>>;
    } = {
      filterTags: computed(() => {
        const value = Data.filterTag.value.trim();
        return Data.tags.value.filter((tag) => tag.name.includes(value));
      }),
      activeSort: computed(() => Data.sort.find((sort) => sort.value === Data.searchData.sort)),
      activeCate: computed(() =>
        Data.categories.value.find((cate) => cate.id === Data.searchData.category),
      ),
      activeTags: computed(() => {
        const selected = Data.searchData.tags;
        const tagsMap = Data.tagsMap;
        const tags = Data.tags.value;
        if (!tags.length) return [];
        return selected.map((id) => tagsMap[id]);
      }),
      resultTag: computed(() => {
        const selectedSort: Sort = Computed.activeSort.value || { label: '', value: 0 };
        return [
          { name: selectedSort.label, id: selectedSort.value, type: 'sort' },
          {
            name: '',
            id: 0,
            ...Computed.activeCate.value,
            type: 'cate',
          },
          ...Computed.activeTags.value,
        ];
      }),
    };
    const _Methods = {
      initSearchData() {
        const q = route.query;
        const data = Data.searchData;
        data.keyword = q.query || '';
        data.sort = q.sort ? Number(q.sort) : 3;
        data.category = q.cate ? Number(q.cate) : 0;
        data.tags = ((q.tags || '') as string).split(',').filter(Boolean).map(Number);
      },
      async getTagList() {
        const res = await useAsyncData(() => getTags());
        const tags = res.data.value?.data || [];
        tags.forEach((item: TagEntity) => {
          // item.tagType = ['success', 'info', 'warning', 'danger'][index % 4];
          Data.tagsMap[item.id] = item;
        });
        Data.tags.value = tags;
      },
      async getCategoryListData() {
        const { data } = await useAsyncData(() => getCategoryList());

        let count = 0;
        const categories = (data.value?.data || []).filter((item: CategoryEntity) => {
          if (process.server) {
            item.name = `${item.name}(${item.articleCount})`;
          }
          count += item.articleCount ?? 0;
          return item.articleCount;
        }, 0);

        categories.unshift({
          name: `全部(${count})`,
          id: 0,
        } as CategoryEntity);
        Data.categories.value = categories;
      },
    };
    const Methods = {
      getResultTagClosable(tag: ResultTag) {
        const sd = Data.searchData;
        if (tag.type === 'cate') {
          return sd.category !== 0;
        }
        if (tag.type === 'sort') {
          return sd.sort !== 3;
        }
        return true;
      },
      handleTagClick(tag: TagEntity) {
        const selected = Data.searchData.tags;
        const index = selected.indexOf(tag.id);
        if (index > -1) {
          selected.splice(index, 1);
        } else {
          selected.push(tag.id);
        }
      },
      handleResultTagClick(tag: ResultTag) {
        if (tag.type === 'cate') {
          Data.searchData.category = 0;
          return;
        }
        if (tag.type === 'sort') {
          Data.searchData.sort = 3;
          return;
        }
        Data.searchData.tags.splice(Data.searchData.tags.indexOf(tag.id), 1);
      },
    };

    onMounted(function init() {
      _Methods.initSearchData();

      const handler = debounce((form: typeof Data.searchData) => {
        const query = {
          ...route.query,
          query: form.keyword,
          cate: form.category,
          sort: form.sort,
          tags: form.tags.join(','),
          page: 1,
        };
        navigateTo(
          {
            path: route.path,
            query,
          },
          { replace: true },
        );
      }, 500);
      watch(Data.searchData, handler);
    });

    await Promise.all([_Methods.getCategoryListData(), _Methods.getTagList()]);

    return {
      ...Data,
      ...Computed,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-index-filters {
  padding: 0.5rem;
  .operation {
    flex-wrap: wrap;
    font-size: 14px;
    > div {
      margin-right: 10px;
      border-radius: 4px;
      color: var(--text-color);
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
      &:focus-visible,
      .el-tooltip__trigger:focus-visible {
        border: 0;
        outline: 0;
      }
    }
    @media (max-width: 750px) {
      white-space: nowrap;
      width: 100%;
      overflow: auto;
    }
  }
}
.pop-content {
  padding: 10px 10px 0;
  .tags-wrapper {
    margin: 20px 0;
  }
  .el-tag {
    margin: 4px;
    cursor: pointer;
  }
  .pop-bottom {
    text-align: right;
  }
}
</style>
