<script setup lang="ts">
import { deleteArticle, getAllArticleList, setArticleAs, restoreArticle } from '@blog/apis';
import { type ArticleEntity, ARTICLE_STATE, type TagEntity } from '@blog/entities';
import { formatDate as formatDateKit } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import type { CustomCacheConfig } from 'request-template';
import { useRouter } from '#app';
import useUserStore from '~/store/user.store';
import { useToggleState } from '~/feature/hooks';

const router = useRouter();
const userStore = useUserStore();
const [loading, toggleLoading] = useToggleState(false);
const searchValue = ref('');

const articleList = ref<ArticleEntity[]>([]);
const page = reactive({ page: 1, pageSize: 10, total: 1 });

async function getData(cache: CustomCacheConfig = { enable: process.client }) {
  toggleLoading(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { total, ...rest } = page;
  const { data } = await getAllArticleList(
    {
      ...rest,
      tags: [],
      sort: 3,
      keyword: searchValue.value,
    },
    cache,
  );
  articleList.value = data.list;
  page.total = data.count;
  toggleLoading(false);
}

const formatDate = (date: string) => formatDateKit(new Date(date));

const doSomething = async (msg: string, entity: ArticleEntity, api: typeof deleteArticle) => {
  await ElMessageBox.confirm(msg.replace('{title}', entity.title));
  toggleLoading(true);
  try {
    await api(entity.id);
  } finally {
    toggleLoading(false);
  }
};

async function handleCommand(command: 'delete' | 'restore' | 'edit', entity: ArticleEntity) {
  switch (command) {
    case 'delete':
      await doSomething('是否删除【{title}】?', entity, deleteArticle);
      break;
    case 'restore':
      await doSomething('是否还原【{title}】?', entity, restoreArticle);
      break;
    case 'edit':
      router.push({ path: '/article/create', query: { id: entity.id } });
      return;
  }
  getData({ refresh: true, enable: true });
}

async function setAs(entity: ArticleEntity) {
  const { value } = await ElMessageBox.prompt('设为', {
    inputValue: entity.as || '',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });

  await setArticleAs(entity.id, { as: value });
  getData({ refresh: true, enable: true });
}

function toSearch() {
  if (page.page === 1) {
    getData();
    return;
  }
  page.page = 1;
}

function joinTags(tags: TagEntity[]) {
  return tags.map((it) => it.name).join(',');
}

watch(
  () => page.page,
  () => {
    getData();
  },
);

watch(
  userStore.user,
  (n) => {
    if (n.role !== 0) router.back();
  },
  { immediate: true },
);

getData();
</script>

<template>
  <div class="pg article">
    <div class="search-box _ flex-c">
      <el-input
        v-model="searchValue"
        placeholder="搜索文章"
        clearable
        @keydown.enter="toSearch"
        @clear="toSearch">
      </el-input>
      <el-button type="primary" @click="toSearch">
        <el-icon><Search /></el-icon>
      </el-button>
    </div>
    <el-table v-loading="loading" :data="articleList" empty-text="暂无文章" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="标题" prop="title">
        <template #default="scope">
          <ClientOnly>
            <NuxtLink :to="scope.row.as ? `/${scope.row.as}` : `/article/detail/${scope.row.id}`">
              <component :is="scope.row.deletedAt ? 'del' : 'span'">
                {{ scope.row.title }}
              </component>
            </NuxtLink>
          </ClientOnly>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          {{ ARTICLE_STATE[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column label="文章分类">
        <template #default="scope">
          {{ scope.row.category.name }}
        </template>
      </el-table-column>
      <el-table-column label="标签">
        <template #default="scope">
          {{ joinTags(scope.row.tags) }}
        </template>
      </el-table-column>
      <el-table-column label="作者">
        <template #default="scope">
          {{ scope.row.author.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="设为">
        <template #default="scope">
          <el-button :disabled="scope.row.deletedAt" link @click="setAs(scope.row)">
            {{ scope.row.as || '--' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          {{ formatDate(scope.row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新日期" prop="updateAt">
        <template #default="scope">
          {{ formatDate(scope.row.updateAt) }}
        </template>
      </el-table-column>

      <el-table-column label="封面">
        <template #default="scope">
          <el-image
            :src="scope.row.cover"
            :preview-src-list="[scope.row.cover]"
            preview-teleported />
        </template>
      </el-table-column>

      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="scope.row.deletedAt" command="restore">
                  还原
                </el-dropdown-item>
                <el-dropdown-item v-else command="delete">删除</el-dropdown-item>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <div class="_ flex-c-c pager">
      <el-pagination
        v-model:current-page="page.page"
        background
        :total="page.total"
        :page-size="10"
        layout="prev, pager, next,total" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pg.article {
  > section {
    position: relative;
    padding: 20px;
  }
  .pager {
    margin-top: 2rem;
  }
  .el-image {
    max-width: 100px;
    max-height: 100px;
  }
  .search-box {
    width: 500px;
  }
  .el-input .el-input__wrapper {
  }
}
</style>
