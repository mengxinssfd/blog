import { HttpStatus, type StatusHandler, type StatusHandlers } from 'request-template';
import { ElNotification } from 'element-plus';
import { Token } from './token';
import { type PrimaryCustomConfig } from '@blog/apis';
import useUserStore from '~/store/user.store';

// 通用错误Handler
const errorHandler: StatusHandler<PrimaryCustomConfig> = ({ customConfig }, res, data) => {
  if (process.client) {
    !customConfig.silent &&
      ElNotification({
        title: 'Error',
        message: data.msg,
        type: 'error',
      });
  } else {
    import.meta.env.VITE_MODE_NAME === 'development' && console.error(data.msg);
  }

  // throw data.data || new Error( `data: ${JSON.stringify(data)}`);
  return Promise.reject(customConfig.returnRes ? res : data);
};

// enum StatusCode的方式有问题  直接写好了
export const statusHandlers: StatusHandlers<PrimaryCustomConfig> = {
  [HttpStatus.UNAUTHORIZED]: (ctx, res, data) => {
    // sessionStorage.removeItem('user');
    // Store.commit('clearUser');
    Token.clear();
    useUserStore().clear();
    return errorHandler(ctx, res, data);
  },
  207: (_, _2, data) => {
    const token = (data.data as any)?.token;
    if (typeof token === 'string' && !process.server) Token.set(token);
  },
  [HttpStatus.OK]: ({ customConfig }, _, data) => {
    !process.server &&
      customConfig.showSuccessMsg &&
      ElNotification({ type: 'success', message: customConfig.successMsg || data.msg });
  },
  [HttpStatus.CREATED]: ({ customConfig }, _, data) => {
    !process.server &&
      customConfig.showSuccessMsg &&
      ElNotification({ type: 'success', message: customConfig.successMsg || data.msg });
  },
  default: errorHandler,
};
