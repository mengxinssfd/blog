<template>
  <div class="pg file">
    <WidgetUpload minimal @success="onUploaded" />
    <el-table v-loading="loading" :data="fileList" empty-text="暂无文件" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="文件类型" prop="mimetype" width="130" />
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          {{ formatDate(scope.row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="文件名" prop="filename" />
      <el-table-column label="图片" prop="url">
        <template #default="scope">
          <template v-if="scope.row.mimetype.startsWith('image')">
            <el-image :src="scope.row.url" :preview-src-list="[scope.row.url]" preview-teleported />
          </template>
          <a v-else :href="scope.row.url">{{ scope.row.url }}</a>
        </template>
      </el-table-column>

      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text>管理</el-button>
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

<script setup lang="ts">
import { getFileList as getFileListApi, deleteFile as deleteFileApi } from '@blog/apis';
import type { FileEntity } from '@blog/entities';
import { formatDate as formatDateKit } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import { useRouter } from '#app';
import useUserStore from '~/store/user.store';
import { useToggleState } from '~/feature/hooks';

const router = useRouter();
const userStore = useUserStore();
const [loading, toggleLoading] = useToggleState(false);

const fileList = ref<FileEntity[]>([]);
const page = reactive({ page: 1, pageSize: 10, total: 1 });

async function getData() {
  toggleLoading(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { total, ...rest } = page;
  const { data } = await getFileListApi(rest);
  fileList.value = data.list;
  page.total = data.count;
  toggleLoading(false);
}

const formatDate = (date: string) => formatDateKit(new Date(date));

const deleteFile = async (entity: FileEntity) => {
  await ElMessageBox.confirm(`是否删除【${entity.filename}】?`);
  toggleLoading(true);
  try {
    await deleteFileApi(entity.id);
    await getData();
  } finally {
    toggleLoading(false);
  }
};
function handleCommand(command: 'delete', entity: FileEntity) {
  switch (command) {
    case 'delete':
      deleteFile(entity);
  }
}

function onUploaded() {
  ElMessageBox({ type: 'success', message: '添加成功' });
  getData();
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
<style lang="scss" scoped>
.pg.file {
  > section {
    position: relative;
    padding: 20px;
  }
  .pager {
    margin-top: 2rem;
  }
}
</style>
