import { makeSalt } from '@/utils/cryptogram';
import { isDev } from '@/utils/utils';
// 存储各种用到的常量
export const jwtConstants = {
  secret: isDev() ? 'helloWorld' : makeSalt(), // 密钥
};
