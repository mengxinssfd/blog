<template>
  <div class="c-search">
    <el-input v-model="keyword" size="large" placeholder="Please input" class="input-with-select">
      <template #prepend>
        <el-select v-model="searchType.value" placeholder="Select" style="width: 115px">
          <el-option v-for="item in searchType.list" :key="item.value" v-bind="item" />
        </el-select>
      </template>
      <template #append>
        <el-button :icon="Search" />
      </template>
    </el-input>
  </div>
</template>

<script lang="ts">
import { Search } from '@element-plus/icons-vue';

enum SearchTypes {
  blog,
  bing,
  baidu,
  github,
  npm,
  jsdelivr,
}

export default defineComponent({
  setup() {
    const Data = {
      SearchTypes,
      keyword: ref(''),
      searchType: reactive({
        list: [
          {
            label: '博客文章',
            value: SearchTypes.blog,
          },
          {
            label: '必应',
            value: SearchTypes.bing,
          },
        ],
        value: SearchTypes.blog,
      }),
    };
    const Methods = {
      search() {
        console.log('111');
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const init = () => {};

    init();
    return {
      ...Data,
      ...Methods,
      Search,
    };
  },
});
</script>
<style lang="scss">
.c-search {
  width: 800px;
  margin: auto;
}
</style>
