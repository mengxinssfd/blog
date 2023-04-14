<template>
  <div class="pg admin-friend-link">
    <div class="filters">
      <IndexTags v-model:value="filter.value" :list="filter.list" @change="getData" />
    </div>
    <el-table :data="linkList" empty-text="暂无友链" stripe>
      <el-table-column label="id" prop="id" width="60" />
      <el-table-column label="头像" width="60">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar" :size="32"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="网站名" prop="name" width="130" />
      <el-table-column label="描述" prop="desc" />
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
          <span class="status" :class="FriendLinkState[scope.row.status]">
            {{ FriendLinkState[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" header-align="center" width="90">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text>管理</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="resolve">通过</el-dropdown-item>
                <el-dropdown-item command="reject">拒绝</el-dropdown-item>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-loading="scope.row.loading"
            type="primary"
            size="small"
            @click="updateSiteInfo(scope.row)">
            更新信息
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <FriendLinkFullDialog
      v-model:show="dialogVisible"
      :data="editLink"
      @success="onSuccess"></FriendLinkFullDialog>
  </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate, updateObj } from '@tool-pack/basic';
import { adjudgeFriendLink, getFriendLinkList, refreshSiteInfo } from '@blog/apis';
import { type FriendLinkEntity, FriendLinkState } from '@blog/entities';

type FriendLinkItem = FriendLinkEntity & { loading?: boolean };

export default defineComponent({
  setup() {
    const Data = {
      FriendLinkState,
      dialogVisible: ref(false),
      linkList: ref<FriendLinkItem[]>([]),
      filter: reactive({
        list: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '未审核',
            value: FriendLinkState.padding,
          },
          {
            label: '已通过',
            value: FriendLinkState.resolve,
          },
          {
            label: '已拒绝',
            value: FriendLinkState.reject,
          },
        ],
        value: '',
      }),
      editLink: ref<FriendLinkEntity>({} as FriendLinkEntity),
    };
    const Methods = {
      showLinkApplyDialog() {
        Data.dialogVisible.value = true;
      },
      onSuccess() {
        ElMessage({ type: 'success', message: '编辑成功，已改为待审状态' });
        Methods.getData();
      },
      async handleCommand(command: 'resolve' | 'reject' | 'edit', link: FriendLinkEntity) {
        if (command === 'edit') {
          Data.editLink.value = link;
          Methods.showLinkApplyDialog();
          return;
        }
        const data: any = { status: FriendLinkState[command] };
        if (command === 'reject') {
          data.rejectReason = (
            await ElMessageBox.prompt('拒绝原因', '拒绝原因', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPattern: /[\s\S]{1,200}$/,
              inputErrorMessage: '1-200个字符',
            })
          ).value;
        }
        await adjudgeFriendLink(link.id, data);
        ElMessage({ type: 'success', message: '设置成功' });
      },
      async getData() {
        const {
          data: { list = [] },
        } = await getFriendLinkList({ status: Data.filter.value });
        list.forEach((item) => {
          item.createAt = new Date(item.createAt);
        });
        Data.linkList.value = list;
      },
      async updateSiteInfo(item: FriendLinkItem) {
        item.loading = true;
        const res = await refreshSiteInfo(item.id);
        updateObj(item, res.data);
        item.loading = false;
      },
    };
    const init = () => {
      Methods.getData();
    };

    init();
    return {
      ...Data,
      ...Methods,
      formatDate,
    };
  },
});
</script>
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
