import { defineStore } from 'pinia';
import { useAsyncData } from '#app';
import { type UserEntity, ROLE } from '@blog/entities';
import { getSelfInfo as getSelfInfoApi, login as loginApi } from '@blog/apis';
import { Token } from '~/feature/request/primary/token';
import type { CustomCacheConfig } from 'request-template';

const useUserStore = defineStore('user', () => {
  // const user = ref<UserEntity>({} as UserEntity);
  const user = useState<UserEntity>('user', () => ({} as UserEntity));
  const isSuperAdmin = computed(() => user.value.role === ROLE.superAdmin);

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

  return {
    user,
    useUser,
    login,
    getSelfInfo,
    isSuperAdmin,
    isLogin,
    logout() {
      Token.clear();
      user.value = {} as UserEntity;
    },
  };
});

export default useUserStore;
