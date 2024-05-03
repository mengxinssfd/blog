<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { formatDate } from '@tool-pack/basic';
import { deleteProject, getProjectList } from '@blog/apis';
import type { ProjectEntity } from '@blog/entities';
import { PROJECT_STATUS } from '@blog/entities/constant';
import { useRequest } from '@request-template/vue3-hooks';

const dialogVisible = ref(false);
const editData = ref<ProjectEntity>();
function showDialog() {
  dialogVisible.value = true;
}

async function handleCommand(command: 'edit' | 'delete', link: ProjectEntity) {
  switch (command) {
    case 'edit':
      editData.value = link;
      showDialog();
      return;
    case 'delete':
      await ElMessageBox.confirm('是否删除该项目？');
      await deleteProject(link.id);
      request();
  }
}

const formatTime = (time?: Date | null) => {
  if (!time) return '';
  return formatDate(new Date(time));
};

const { data, loading, request } = useRequest(getProjectList, {
  loading: { threshold: 500, immediate: true },
});

const projectList = computed(() => data.value?.list || []);

const createProject = () => {
  editData.value = undefined;
  showDialog();
};

onBeforeMount(request);
</script>

<template>
  <div class="pg admin-project">
    <el-button type="primary" @click="createProject">新增</el-button>
    <el-table v-loading="loading" :data="projectList" empty-text="暂无项目" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="名称" prop="name" width="130" />
      <el-table-column label="分类" width="130">
        <template #default="scope">
          <el-tag v-if="scope.row.category">{{ scope.row.category.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="desc">
        <template #default="scope"> {{ scope.row.desc.slice(0, 10) }}... </template>
      </el-table-column>
      <el-table-column label="技术栈" prop="techStack" />
      <el-table-column label="转移到" prop="transferredTo" />
      <el-table-column label="权重" prop="weights" />
      <el-table-column label="链接">
        <template #default="scope">
          <a :href="scope.row.link" target="_blank" rel="noreferrer noopener">
            {{ scope.row.link }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="封面" prop="cover">
        <template #default="scope">
          <el-image
            :src="scope.row.cover"
            :preview-src-list="[scope.row.cover]"
            preview-teleported />
        </template>
      </el-table-column>
      <el-table-column label="开始日期">
        <template #default="scope">
          {{ formatTime(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="结束日期">
        <template #default="scope">
          {{ formatTime(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <span class="status" :class="PROJECT_STATUS[scope.row.status].toLowerCase()">
            {{ PROJECT_STATUS[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <ProjectFormDialog v-model:show="dialogVisible" :data="editData" @success="request" />
  </div>
</template>

<style lang="scss">
.pg.admin-project {
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
