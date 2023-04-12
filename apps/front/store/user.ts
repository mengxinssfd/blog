import { defineStore } from 'pinia';
import { useAsyncData } from '#app';
import type { UserEntity } from '@blog/entities';
import { getSelfInfo as getSelfInfoApi, login as loginApi } from '@blog/apis';
import { Token } from '~/feature/request/primary/token';

const useUserStore = defineStore('user', () => {
  const user = ref<UserEntity>({} as UserEntity);

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password });
    Token.set(res.data.token);
    getSelfInfo();
  }
  async function getSelfInfo() {
    try {
      const { data } = await useAsyncData(() => getSelfInfoApi(), {
        default: () => ({ data: { user: {} } } as any),
      });
      user.value = data.value.data.user;
    } catch (e) {
      console.log(e);
    }
  }

  return {
    user,
    login,
    getSelfInfo,
  };
});

export default useUserStore;
