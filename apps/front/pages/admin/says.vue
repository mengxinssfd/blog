<script setup lang="ts">
import { deleteSays, getSaysListByAdmin } from '@blog/apis';
import { type SaysEntity, SaysVisibleStatus } from '@blog/entities';
import { formatDate as formatDateKit, omit, howLongAgo as howLongAgoKit } from '@tool-pack/basic';
import { ElMessageBox } from 'element-plus';
import { useRequest } from '@request-template/vue3-hooks';
import useUserStore from '~/store/user.store';
import { howLongAgo } from '~/feature/utils';

const router = useRouter();
const userStore = useUserStore();

const page = reactive({ page: 1, pageSize: 10, total: 1 });
const edit = reactive<{ visible: Boolean; data?: SaysEntity }>({
  visible: false,
  data: undefined,
});

const { data, request, loading } = useRequest(() => getSaysListByAdmin(omit(page, ['total'])), {
  loading: { threshold: 500 },
});

const list = computed(() =>
  (data.value?.list || []).map((item) => ({
    ...item,
    expires: item.expires ? new Date(item.expires) : undefined,
  })),
);

watch(data, (n) => {
  if (!n) return;
  page.total = n.count;
});

watch(() => page.page, request);

watch(
  userStore.user,
  (n) => {
    if (n.role !== 0) router.back();
  },
  { immediate: true },
);

onMounted(request);

const formatDate = (date: string) => (date ? formatDateKit(new Date(date)) : '--');

async function handleCommand(command: 'delete' | 'edit', entity: SaysEntity) {
  switch (command) {
    case 'delete':
      await ElMessageBox.confirm(`是否删除【${entity.content}】?`);
      try {
        loading.value = true;
        await deleteSays(entity.id);
        await request();
      } finally {
        loading.value = false;
      }
      break;
    case 'edit':
      edit.data = entity;
      edit.visible = true;
      break;
  }
}

const getExpiresClass = (entity: SaysEntity) => {
  if (!entity.expires) return 'green';
  return entity.expires.getTime() > Date.now() ? 'green' : 'red';
};

const createOne = () => {
  edit.data = undefined;
  edit.visible = true;
};

const getExpires = (item: SaysEntity) => {
  return item.expires
    ? howLongAgoKit(new Date(), {
        now: item.expires,
        templates: { season: '~~' },
        def: '',
      }).replace('前', '后')
    : '--';
};
</script>

<template>
  <div class="pg says">
    <el-button type="primary" @click="createOne">新增</el-button>
    <el-table v-loading="loading" :data="list" empty-text="暂无评论" style="width: 100%" stripe>
      <el-table-column type="index" label="序号" width="60" fixed />
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="visible" width="80">
        <template #default="scope">
          {{ SaysVisibleStatus[scope.row.visible] }}
        </template>
      </el-table-column>
      <el-table-column label="过期时间">
        <template #default="scope">
          <span :class="getExpiresClass(scope.row)">
            {{ formatDate(scope.row.expires) }}
            ({{ getExpires(scope.row) }})
          </span>
        </template>
      </el-table-column>
      <el-table-column label="内容" prop="content" width="200" />
      <el-table-column label="创建时间" prop="createAt">
        <template #default="scope">
          {{ howLongAgo(scope.row.createAt) }}
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
      <el-table-column label="操作" header-align="center" width="90" fixed="right">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
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
  <SaysCreator v-model="edit.visible" :data="edit.data" @success="request"></SaysCreator>
</template>

<style lang="scss" scoped>
.pg.says {
  .red {
    color: red;
  }
  .green {
    color: green;
  }
}
</style>
