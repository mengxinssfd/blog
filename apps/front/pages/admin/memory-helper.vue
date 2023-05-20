<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { formatDate } from '@tool-pack/basic';
import { deleteMemory, getMemoryList } from '@blog/apis';
import { type MemoryHelperEntity } from '@blog/entities';
import { useRequest } from '@request-template/vue3-hooks';

const dialogVisible = ref(false);
const memoryId = ref<number>(0);
function showDialog() {
  dialogVisible.value = true;
}

async function handleCommand(command: 'edit' | 'delete', entity: MemoryHelperEntity) {
  switch (command) {
    case 'edit':
      memoryId.value = entity.id;
      showDialog();
      return;
    case 'delete':
      await ElMessageBox.confirm('是否删除？');
      await deleteMemory(entity.id);
      request();
  }
}

const formatTime = (time?: Date | null) => {
  if (!time) return '';
  return formatDate(new Date(time));
};

const { data, loading, request } = useRequest(getMemoryList, {
  loading: { threshold: 500, immediate: true },
});

const list = computed(() => data.value?.list || []);

const createMemory = () => {
  memoryId.value = 0;
  showDialog();
};

onBeforeMount(request);
</script>

<template>
  <div class="pg admin-memory">
    <el-button type="primary" @click="createMemory">新增</el-button>
    <el-table v-loading="loading" :data="list" empty-text="暂无项目" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="名称" prop="title" width="130" />
      <el-table-column label="描述" prop="desc" />
      <el-table-column label="创建人">
        <template #default="scope">
          {{ scope.row.creator.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          {{ formatTime(scope.row.createAt) }}
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
    <MemoryHelperCreator v-model:visible="dialogVisible" :memory-id="memoryId" @success="request" />
  </div>
</template>

<style lang="scss">
.pg.admin-memory {
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
