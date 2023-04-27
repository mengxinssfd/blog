import { defineStore } from 'pinia';
import { useAsyncData } from '#app';
import type { UserEntity } from '@blog/entities';
import { getSelfInfo as getSelfInfoApi, login as loginApi } from '@blog/apis';
import { Token } from '~/feature/request/primary/token';
import type { CustomCacheConfig } from 'request-template';

const useUserStore = defineStore('user', () => {
  const user = ref<UserEntity>({} as UserEntity);

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password });
    Token.set(res.data.token);
    getSelfInfo({ refresh: true });
  }
  async function getSelfInfo(
    cache: CustomCacheConfig = { enable: true, timeout: 60 * 1000, failedReq: true },
  ) {
    try {
      const { data } = await useAsyncData(() => getSelfInfoApi(cache));
      user.value = data.value?.data.user || ({} as UserEntity);
    } catch (e) {
      console.log(e);
    }
  }

  return {
    user,
    login,
    getSelfInfo,
    logout() {
      Token.clear();
      user.value = {} as UserEntity;
    },
    isLogin() {
      return Token.exists();
    },
  };
});

export default useUserStore;
