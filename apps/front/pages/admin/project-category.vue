<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { formatDate } from '@tool-pack/basic';
import { deleteProjectCategory, getProjectCategoryListByAdmin, restoreProjectCategory } from '@blog/apis';
import { type ProjectCategoryEntity } from '@blog/entities';
import { useRequest } from '@request-template/vue3-hooks';

const dialogVisible = ref(false);
const editData = ref<ProjectCategoryEntity>();
function showDialog() {
  dialogVisible.value = true;
}

async function handleCommand(command: 'edit' | 'delete' | 'restore', link: ProjectCategoryEntity) {
  switch (command) {
    case 'edit':
      editData.value = link;
      showDialog();
      break;
    case 'delete':
      await ElMessageBox.confirm('是否删除该分类？');
      await deleteProjectCategory(link.id);
      request();
      break;
    case 'restore':
      await ElMessageBox.confirm('是否恢复该分类？');
      await restoreProjectCategory(link.id);
      request();
      break;
  }
}

const formatTime = (time?: Date | null) => {
  if (!time) return '';
  return formatDate(new Date(time));
};

const page = reactive({ page: 1, pageSize: 10 });
const { data, loading, request } = useRequest(() => getProjectCategoryListByAdmin(page), {
  loading: { threshold: 500, immediate: true },
});
const pageTotal = computed(() => data.value?.count || 1);

watch(
  () => page.page,
  () => {
    request();
  },
);

const list = computed(() => data.value?.list || []);

const createProjectCategory = () => {
  editData.value = undefined;
  showDialog();
};

onBeforeMount(request);
</script>

<template>
  <div class="pg admin-project-category">
    <el-button type="primary" @click="createProjectCategory">新增项目分类</el-button>
    <el-table v-loading="loading" :data="list" empty-text="暂无项目分类" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="名称" prop="name" width="130" />
      <el-table-column label="描述" prop="desc" />
      <el-table-column label="权重" prop="weights" />
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          {{ formatTime(scope.row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="删除时间" prop="deletedAt">
        <template #default="scope">
          {{ formatTime(scope.row.deletedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item v-if="!scope.row.deletedAt" command="delete">
                  删除
                </el-dropdown-item>
                <el-dropdown-item v-else command="restore">恢复</el-dropdown-item>
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
        :total="pageTotal"
        :page-size="page.pageSize"
        layout="prev, pager, next,total" />
    </div>
    <ProjectCategoryCreator v-model="dialogVisible" :data="editData" @success="request" />
  </div>
</template>

<style lang="scss">
.pg.admin-project-category {
  .completed {
    background-color: #1ec81e;
  }
  .developing {
    background-color: var(--theme-color);
  }
  .transferred {
    background-color: #dc181a;
  }
}
</style>
