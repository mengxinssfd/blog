import { defineStore } from 'pinia';
import { useAsyncData } from '#app';
import type { UserEntity } from '@blog/entities';
import { getSelfInfo, login } from '@blog/apis';
import { Token } from '~/feature/request/primary/token';

const useUserStore = defineStore({
  id: 'user',
  state: () => {
    return {} as UserEntity;
  },
  actions: {
    async login(username: string, password: string) {
      const res = await login({ username, password });
      Token.set(res.data.token);
      this.getSelfInfo();
    },
    async getSelfInfo() {
      console.log('getSelfInfo');
      try {
        const {
          data: {
            value: {
              data: { user },
            },
          },
        } = await useAsyncData(() => getSelfInfo(), { default: () => ({ data: {} } as any) });
        this.$state = user;
      } catch (e) {
        console.log(e);
      }
    },
  },
});

export default useUserStore;
