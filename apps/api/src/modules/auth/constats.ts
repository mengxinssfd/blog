// 存储各种用到的常量

import { makeSalt } from '../../utils/cryptogram';
import { isDev } from '../../utils/utils';
export const jwtConstants = {
  secret: isDev() ? 'helloWorld' : makeSalt(), // 密钥
};
