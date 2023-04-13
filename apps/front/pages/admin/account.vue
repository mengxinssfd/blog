<template>
  <div class="pg admin-account">
    <div class="filters">
      <IndexTags v-model:value="filter.value" :list="filter.list" @change="getData" />
    </div>
    <el-table :data="userList">
      <el-table-column label="头像" width="60">
        <template #default="scope">
          <router-link :to="`/user/info/${scope.row.id}`">
            <el-avatar :src="scope.row.avatar" :size="32"></el-avatar>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column label="username">
        <template #default="scope">
          <div class="username" :class="{ deleted: scope.row.deletedAt }">
            {{ scope.row.username }} [{{ scope.row.id }}]
          </div>
        </template>
      </el-table-column>

      <el-table-column label="nickname" prop="nickname"></el-table-column>

      <el-table-column label="role">
        <template #default="scope">
          <el-dropdown
            :disabled="ROLE.superAdmin === scope.row.role"
            @command="handleRoleCommand($event, scope.row)">
            <el-button type="primary" text class="role">
              <i class="iconfont icon-user"></i>{{ getRoleName(scope.row) }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-for="role in roleList">
                  <el-dropdown-item v-if="role !== scope.row.role" :key="role" :command="role">
                    {{ RoleNames[role] }}
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150">
        <template #default="scope">
          {{ getFormattedDate(scope.row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="上次登录时间" width="150">
        <template #default="scope">
          {{ getFormattedDate(scope.row.loginAt) }}
        </template>
      </el-table-column>
      <el-table-column label="注册IP" prop="registerIp"></el-table-column>
      <el-table-column label="登录IP" prop="loginIp"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-dropdown
            v-if="ROLE.superAdmin !== scope.row.role"
            @command="handleCommand($event, scope.row)">
            <el-button type="primary" text>管理</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-if="!scope.row.deletedAt">
                  <el-dropdown-item command="update">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                  <el-dropdown-item command="mute">
                    {{ scope.row.muted ? '解除禁言' : '禁言' }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item v-else command="restore">恢复</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <UserUpdateInfoDialog v-model:show="updateData.visible" :user="updateData.user" />
  </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { cancelMuteUser, deleteUser, getUserAll, muteUser, restoreUser, setRole } from '@blog/apis';
import { ROLE, type UserEntity } from '@blog/entities';
import { howLongAgo } from '~/feature/utils';

type InnerUser = UserEntity & { muteLoading: boolean; registerIp: string; loginIp: string };
const RoleNames: Record<ROLE, string> = {
  [ROLE.superAdmin]: '超级管理员',
  [ROLE.admin]: '管理员',
  [ROLE.dev]: '作者',
  [ROLE.commonUser]: '普通用户',
};
export default defineComponent({
  setup() {
    const Data = {
      ROLE,
      RoleNames,
      roleList: [/* ROLE.superAdmin, */ ROLE.admin, ROLE.dev, ROLE.commonUser],
      userList: ref<InnerUser[]>([]),
      filter: reactive({
        list: [
          {
            label: '全部',
            value: '',
          },
        ],
        value: '',
      }),
      updateData: reactive({
        user: {} as UserEntity,
        visible: false,
      }),
    };
    const Methods = {
      getRoleName(row: InnerUser) {
        return RoleNames[row.role];
      },
      getFormattedDate: howLongAgo,
      async setMute(mute: boolean, user: InnerUser) {
        user.muteLoading = true;
        try {
          await (mute ? muteUser : cancelMuteUser)(user.id);
          ElMessage({ type: 'success', message: '设置成功' });
        } catch (e) {
          user.muted = !mute;
        } finally {
          setTimeout(() => (user.muteLoading = false), 500);
        }
      },
      async handleRoleCommand(ro: ROLE, user: InnerUser) {
        const {
          data: { role },
        } = await setRole(user.id, ro);
        ElMessage({ type: 'success', message: '设置成功' });
        user.role = role;
      },
      async handleCommand(command: 'delete' | 'mute' | 'restore' | 'update', user: InnerUser) {
        switch (command) {
          case 'update':
            Data.updateData.user = user;
            Data.updateData.visible = true;
            break;
          case 'delete':
            await ElMessageBox.confirm('确认要删除该账号?', 'Warning', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
            });
            await deleteUser(user.id);
            ElMessage({ type: 'success', message: '删除成功' });
            Methods.getData();
            break;
          case 'mute':
            user.muted = !user.muted;
            Methods.setMute(user.muted, user);
            break;
          case 'restore':
            await restoreUser(user.id);
            Methods.getData();
            break;
        }
      },
      async getData() {
        const {
          data: { list = [] },
        } = await getUserAll(/* { status: Data.filter.value } */);
        Data.userList.value = list.map((item) => ({ ...item, muteLoading: false } as any));
      },
    };
    const init = () => {
      Methods.getData();
    };

    init();
    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.pg.admin-account {
  .el-table {
    .el-table__cell {
      text-align: center;
    }
  }
  li {
    position: relative;
    padding: 20px;
    .left {
      padding-top: 8px;
    }
    .middle {
      margin-left: 10px;
    }
    .username {
      margin-right: 10px;
      &.deleted {
        text-decoration: line-through;
      }
    }
    /* .el-dropdown {
       position: absolute;
       right: 0;
       top: 0;
       padding: 2px 4px;
     }*/
    .icon-select {
      font-size: 16px;
      font-weight: bold;
      &:hover {
        color: var(--link-hover-color);
      }
    }
  }
}
</style>
