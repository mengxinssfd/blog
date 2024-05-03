import { defineStore } from 'pinia';
import { useAsyncData } from '#app';
import type { UserEntity } from '@blog/entities';
import { USER_ROLE } from '@blog/entities/constant';
import { getSelfInfo as getSelfInfoApi, login as loginApi } from '@blog/apis';
import { Token } from '~/feature/request/primary/token';
import type { CustomCacheConfig } from 'request-template';

const useUserStore = defineStore('user', () => {
  // const user = ref<UserEntity>({} as UserEntity);
  const user = useState<UserEntity>('user', () => ({} as UserEntity));
  const isSuperAdmin = computed(() => user.value.role === USER_ROLE.superAdmin);
  const isRoleOfGreaterThanOrEqualDev = computed(() => user.value.role < USER_ROLE.dev);

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password });
    Token.set(res.data.token);
    getSelfInfo({ refresh: true });
  }

  let p: Promise<void> | undefined;

  const isLogin = () => Token.exists();

  async function getSelfInfo(
    cache: CustomCacheConfig = { enable: true, timeout: 60 * 1000, failedReq: true },
  ) {
    if (!isLogin()) return;

    try {
      const { data } = await useAsyncData(() => getSelfInfoApi(cache));
      user.value = data.value?.data.user || ({} as UserEntity);
    } catch (e) {
      console.log(e);
    } finally {
      p = undefined;
    }
  }

  async function useUser(): Promise<UserEntity> {
    if (p) await p;
    else if (!user.value.id) {
      p = getSelfInfo({ enable: process.client });
      await p;
    }
    return user.value;
  }

  function clear() {
    Token.clear();
    user.value = {} as UserEntity;
  }

  return {
    user,
    useUser,
    login,
    getSelfInfo,
    isSuperAdmin,
    isRoleOfGreaterThanOrEqualDev,
    isLogin,
    clear,
    logout() {
      clear();
    },
  };
});

export default useUserStore;
