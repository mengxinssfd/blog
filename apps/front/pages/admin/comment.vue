<script setup lang="ts">
import { deleteCommentOne, getCommentList } from '@blog/apis';
import type { CommentEntity } from '@blog/entities';
import { formatDate as formatDateKit } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import { useRouter } from '#app';
import useUserStore from '~/store/user.store';
import { useToggleState } from '~/feature/hooks';
import { getCommentArticleLink, getCommentArticleLinkWithoutAnchor } from '~/feature/utils';

const router = useRouter();
const userStore = useUserStore();
const [loading, toggleLoading] = useToggleState(false);

const fileList = ref<CommentEntity[]>([]);
const page = reactive({ page: 1, pageSize: 10, total: 1 });

async function getData() {
  toggleLoading(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { total, ...rest } = page;
  const { data } = await getCommentList(rest);
  fileList.value = data.list;
  page.total = data.count;
  toggleLoading(false);
}

const formatDate = (date: string) => formatDateKit(new Date(date));

const deleteMsg = async (entity: CommentEntity) => {
  await ElMessageBox.confirm(`是否删除【${entity.content}】?`);
  toggleLoading(true);
  try {
    await deleteCommentOne(entity.id);
    await getData();
  } finally {
    toggleLoading(false);
  }
};
function handleCommand(command: 'delete', entity: CommentEntity) {
  switch (command) {
    case 'delete':
      deleteMsg(entity);
  }
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
  <div class="pg comment">
    <el-table v-loading="loading" :data="fileList" empty-text="暂无评论" stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="创建人">
        <template #default="scope">
          {{ scope.row.user?.nickname || scope.row.touristName + '【游客】' }}
        </template>
      </el-table-column>
      <el-table-column label="内容">
        <template #default="scope">
          <NuxtLink :to="getCommentArticleLink(scope.row)">
            <MdViewer :content="scope.row.content" is-md is-preview />
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="文章">
        <template #default="scope">
          <NuxtLink :to="getCommentArticleLinkWithoutAnchor(scope.row)">
            {{ scope.row.article.title }}
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          {{ formatDate(scope.row.createAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
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
.pg.file {
}
</style>
