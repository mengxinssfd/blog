import { defineStore } from 'pinia';
import { useAsyncData } from '#app';
import type { UserEntity } from '@blog/entities';
import { getSelfInfo as getSelfInfoApi, login as loginApi } from '@blog/apis';
import { Token } from '~/feature/request/primary/token';

const useUserStore = defineStore('user', () => {
  const $state = ref<UserEntity>({} as UserEntity);

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
      $state.value = data.value.data.user;
    } catch (e) {
      console.log(e);
    }
  }

  return {
    $state,
    login,
    getSelfInfo,
  };
});

export default useUserStore;
