<script setup lang="ts">
import { deleteCommentOne, getCommentList, hardDeleteCommentOne } from '@blog/apis';
import type { CommentEntity } from '@blog/entities';
import { formatDate as formatDateKit } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import { getArticleCommentLink, getArticleLink } from '@blog/shared';
import useUserStore from '~/store/user.store';

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

const deleteMsg = async (entity: CommentEntity, delFn: typeof deleteCommentOne) => {
  toggleLoading(true);
  try {
    await delFn(entity.id);
    await getData();
  } finally {
    toggleLoading(false);
  }
};
async function handleCommand(command: 'delete' | 'hardDelete', entity: CommentEntity) {
  switch (command) {
    case 'delete':
      await ElMessageBox.confirm(`是否删除【${entity.content}】?`);
      deleteMsg(entity, deleteCommentOne);
      break;
    case 'hardDelete':
      await ElMessageBox.confirm(`是否删除【${entity.content}】及其子评论?`);
      deleteMsg(entity, hardDeleteCommentOne);
      break;
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

onMounted(getData);
</script>

<template>
  <div class="pg comment">
    <el-table v-loading="loading" :data="fileList" empty-text="暂无评论" style="width: 100%" stripe>
      <el-table-column type="index" label="序号" width="60" fixed />
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="parentId" prop="parentId" width="100" />
      <el-table-column label="创建人">
        <template #default="scope">
          {{ scope.row.user?.nickname || scope.row.touristName + '【游客】' }}
        </template>
      </el-table-column>
      <el-table-column label="内容" width="200">
        <template #default="scope">
          <NuxtLink :to="getArticleCommentLink(scope.row)">
            <MdViewer :content="scope.row.content" is-md is-preview />
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="文章" width="150">
        <template #default="scope">
          <NuxtLink :to="getArticleLink(scope.row)">
            {{ scope.row.article.title }}
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="scope" prop="scope" />
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          {{ formatDate(scope.row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="ip" width="130">
        <template #default="scope">
          {{ scope.row.ip }}
        </template>
      </el-table-column>
      <el-table-column label="地区">
        <template #default="scope">
          {{ scope.row.region || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="系统" prop="os" />
      <el-table-column label="浏览器" prop="browser" />
      <el-table-column label="游客邮箱" prop="touristEmail" />
      <el-table-column label="操作" header-align="center" width="90" fixed="right">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete">软删除</el-dropdown-item>
                <el-dropdown-item command="hardDelete">物理删除</el-dropdown-item>
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
