<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { formatDate, updateObj } from '@tool-pack/basic';
import {
  adjudgeFriendLink,
  deleteFriendLink,
  getFriendLinkList,
  refreshSiteInfo,
  setFriendLinkActive,
} from '@blog/apis';
import type { FriendLinkEntity } from '@blog/entities';
import { FRIEND_LINK_STATE } from '@blog/entities/constant';

const dialogVisible = ref(false);
const linkList = ref<FriendLinkEntity[]>([]);
const filter = reactive({
  list: [
    {
      label: '全部',
      value: '',
    },
    {
      label: '未审核',
      value: String(FRIEND_LINK_STATE.padding),
    },
    {
      label: '已通过',
      value: String(FRIEND_LINK_STATE.resolve),
    },
    {
      label: '已拒绝',
      value: String(FRIEND_LINK_STATE.reject),
    },
  ],
  value: '',
});
const editLink = ref<FriendLinkEntity>({} as FriendLinkEntity);
const loading = ref(false);

function showLinkApplyDialog() {
  dialogVisible.value = true;
}
function onSuccess() {
  ElMessage({ type: 'success', message: '编辑成功' });
  getData();
}
async function handleCommand(
  command: 'resolve' | 'reject' | 'edit' | 'refresh-site' | 'delete',
  link: FriendLinkEntity,
) {
  const data: { status: FRIEND_LINK_STATE; rejectReason?: string } = {
    status: FRIEND_LINK_STATE.resolve,
  };
  switch (command) {
    case 'refresh-site':
      updateSiteInfo(link);
      return;
    case 'edit':
      editLink.value = link;
      showLinkApplyDialog();
      return;
    case 'delete':
      await ElMessageBox.confirm('是否删除该申请？');
      await deleteFriendLink(link.id);
      getData();
      return;
    case 'reject':
      data.rejectReason = (
        await ElMessageBox.prompt('拒绝原因', '拒绝原因', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /[\s\S]{1,200}$/,
          inputErrorMessage: '1-200个字符',
        })
      ).value;
    // eslint-disable-next-line no-fallthrough
    case 'resolve':
      data.status = FRIEND_LINK_STATE[command];
      await adjudgeFriendLink(link.id, data);
      getData();
  }
}
async function getData() {
  loading.value = true;
  await nextTick();
  const {
    data: { list = [] },
  } = await getFriendLinkList({ status: filter.value });
  list.forEach((item) => {
    item.createAt = new Date(item.createAt);
  });
  linkList.value = list;
  loading.value = false;
}
async function updateSiteInfo(item: FriendLinkEntity) {
  loading.value = true;
  try {
    const res = await refreshSiteInfo(item.id);
    if (res.data.screenshot) {
      const url = new URL(res.data.screenshot);
      url.searchParams.set('t', String(Date.now()));
      res.data.screenshot = url.toString();
    }
    updateObj(item, res.data);
  } finally {
    loading.value = false;
  }
}

async function handleActiveCommand(command: 'active' | 'inactive', link: FriendLinkEntity) {
  await ElMessageBox.confirm(`是否设置为${command === 'active' ? '可访问' : '失联'}状态？`);
  await setFriendLinkActive(link.id, { active: command === 'active' });
  await getData();
}

getData();
</script>

<template>
  <div class="pg admin-friend-link">
    <div class="filters">
      <el-tabs v-model="filter.value" @tab-click="getData">
        <el-tab-pane
          v-for="item in filter.list"
          :key="item.label"
          :label="item.label"
          :name="item.value" />
      </el-tabs>
      <!--      <IndexTags v-model:value="filter.value" :list="filter.list" @change="getData" />-->
    </div>
    <el-table v-loading="loading" :data="linkList" empty-text="暂无友链" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="头像" width="60">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar" :size="32"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="网站名" prop="name" width="130" />
      <el-table-column label="描述" prop="desc" />
      <el-table-column label="邮箱" prop="email" />
      <el-table-column label="申请描述" prop="applyDesc" />
      <el-table-column label="可访问状态" prop="active">
        <template #default="scope">
          <el-dropdown @command="handleActiveCommand($event, scope.row)">
            <el-button :type="scope.row.active ? 'primary' : 'danger'" size="small" text>
              {{ scope.row.active ? '可访问' : '失联' }}
              <template #icon>
                <el-icon class="el-icon--right"> <arrow-down /> </el-icon>
              </template>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="active" :disabled="scope.row.active === true">
                  可访问
                </el-dropdown-item>
                <el-dropdown-item command="inactive" :disabled="scope.row.active === false">
                  失联
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template> </el-table-column
      >>
      <el-table-column label="链接">
        <template #default="scope">
          <a :href="scope.row.link" target="_blank" rel="noreferrer noopener">
            {{ scope.row.link }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="截图" prop="screenshot">
        <template #default="scope">
          <el-image
            :src="scope.row.screenshot"
            :preview-src-list="[scope.row.screenshot]"
            preview-teleported />
        </template>
      </el-table-column>
      <el-table-column label="拒绝原因" prop="rejectReason" />
      <el-table-column label="创建日期" prop="createAt">
        <template #default="scope">
          <span>
            {{ formatDate(scope.row.createAt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100">
        <template #default="scope">
          <span class="status" :class="FRIEND_LINK_STATE[scope.row.status]">
            {{ FRIEND_LINK_STATE[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="resolve">通过</el-dropdown-item>
                <el-dropdown-item command="reject">拒绝</el-dropdown-item>
                <el-dropdown-item command="edit" divided>编辑</el-dropdown-item>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
                <el-dropdown-item command="refresh-site">刷新信息</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <FriendLinkFullDialog
      v-model:show="dialogVisible"
      :data="editLink"
      @success="onSuccess"></FriendLinkFullDialog>
  </div>
</template>

<style lang="scss">
.pg.admin-friend-link {
  .status {
    &.resolve {
      color: green;
    }
    &.reject {
      color: red;
    }
    &.padding {
      color: yellow;
    }
  }
}
</style>
