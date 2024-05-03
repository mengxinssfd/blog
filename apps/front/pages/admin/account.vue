<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteUser, getUserAll, restoreUser, setMute as setMuteApi, setRole } from '@blog/apis';
import type { UserEntity } from '@blog/entities';
import { USER_ROLE } from '@blog/entities/constant';
import { useRequest } from '@request-template/vue3-hooks';
import { howLongAgo } from '~/feature/utils';

type InnerUser = UserEntity & { muteLoading: boolean; registerIp: string; loginIp: string };
const RoleNames: Record<USER_ROLE, string> = {
  [USER_ROLE.superAdmin]: '超级管理员',
  [USER_ROLE.admin]: '管理员',
  [USER_ROLE.dev]: '作者',
  [USER_ROLE.commonUser]: '普通用户',
};

const roleList = [/* ROLE.superAdmin, */ USER_ROLE.admin, USER_ROLE.dev, USER_ROLE.commonUser];

const { data, getData, loading } = useRequest(getUserAll, {
  loading: { threshold: 500, immediate: true },
  requestAlias: 'getData',
});

onMounted(getData);

const userList = computed<InnerUser[]>(() =>
  (data.value?.list || []).map((item) => ({ ...item, muteLoading: false } as InnerUser)),
);

const updateData = reactive({
  user: {} as UserEntity,
  visible: false,
});

const getRoleName = (row: InnerUser) => {
  return RoleNames[row.role];
};
const getFormattedDate = (date: string | null) => {
  if (!date) return '--';
  return howLongAgo(date);
};
const setMute = async (mute: boolean, user: InnerUser) => {
  user.muteLoading = true;
  try {
    await setMuteApi(user.id, mute);
    ElMessage({ type: 'success', message: '设置成功' });
  } catch (e) {
    user.muted = !mute;
  } finally {
    setTimeout(() => (user.muteLoading = false), 500);
  }
};
const handleRoleCommand = async (ro: USER_ROLE, user: InnerUser) => {
  const {
    data: { role },
  } = await setRole(user.id, ro);
  ElMessage({ type: 'success', message: '设置成功' });
  user.role = role;
};
const handleCommand = async (
  command: 'delete' | 'mute' | 'restore' | 'update',
  user: InnerUser,
) => {
  switch (command) {
    case 'update':
      updateData.user = user;
      updateData.visible = true;
      break;
    case 'delete':
      await ElMessageBox.confirm('确认要删除该账号?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await deleteUser(user.id);
      ElMessage({ type: 'success', message: '删除成功' });
      getData();
      break;
    case 'mute':
      user.muted = !user.muted;
      setMute(user.muted, user);
      break;
    case 'restore':
      await restoreUser(user.id);
      getData();
      break;
  }
};
</script>

<template>
  <div class="pg admin-account">
    <el-table v-loading="loading" :data="userList">
      <el-table-column label="头像" width="60">
        <template #default="scope">
          <router-link :to="`/user/info/${scope.row.id}`">
            <el-avatar :src="scope.row.avatar" :size="32"></el-avatar>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column label="id" width="60">
        <template #default="scope">
          <div class="username" :class="{ deleted: scope.row.deletedAt }">[{{ scope.row.id }}]</div>
        </template>
      </el-table-column>
      <el-table-column label="username">
        <template #default="scope">
          <div class="username" :class="{ deleted: scope.row.deletedAt }">
            {{ scope.row.username }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="nickname" prop="nickname"></el-table-column>

      <el-table-column label="role">
        <template #default="scope">
          <el-dropdown
            :disabled="USER_ROLE.superAdmin === scope.row.role"
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
      <el-table-column label="创建时间" width="170">
        <template #default="scope">
          {{ getFormattedDate(scope.row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="上次登录时间" width="170">
        <template #default="scope">
          {{ getFormattedDate(scope.row.loginAt) }}
        </template>
      </el-table-column>
      <el-table-column label="注册IP" prop="registerIp"></el-table-column>
      <el-table-column label="登录IP" prop="loginIp"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="操作" width="60">
        <template #default="scope">
          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button type="primary" text><i class="iconfont icon-select"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-if="!scope.row.deletedAt">
                  <el-dropdown-item command="update">编辑</el-dropdown-item>
                  <el-dropdown-item v-if="USER_ROLE.superAdmin !== scope.row.role" command="delete">
                    删除
                  </el-dropdown-item>
                  <el-dropdown-item v-if="USER_ROLE.superAdmin !== scope.row.role" command="mute">
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
    <UserUpdateInfoDialog
      v-model:show="updateData.visible"
      :user="updateData.user"
      by-admin
      @updated="getData" />
  </div>
</template>

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
