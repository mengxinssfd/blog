import { makeSalt } from '@/utils/cryptogram';
import { ENV } from '@/utils/utils';
// 存储各种用到的常量
export const jwtConstants = {
  secret: ENV.isDev() ? 'helloWorld' : makeSalt(), // 密钥
};
