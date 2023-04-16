import { AxiosRequestTemplate } from '@request-template/axios';
import axios from 'axios';
import { PrimaryCustomConfig } from '@blog/apis';

AxiosRequestTemplate.useAxios(axios);

export class ServerRequest<
  CC extends PrimaryCustomConfig = PrimaryCustomConfig,
> extends AxiosRequestTemplate<CC> {
  static ins = new ServerRequest();

  private constructor() {
    super({
      requestConfig: { baseURL: import.meta.env.VITE_BASE_URL },
      customConfig: {
        cache: { enable: false, timeout: 60 * 1000 },
      } as CC,
    });
  }

  // 处理config，添加uuid和token到headers
  protected override handleRequestConfig(requestConfig: any) {
    if (!requestConfig.headers) requestConfig.headers = {};
    requestConfig.headers.Referer = 'from front server api';
    return super.handleRequestConfig(requestConfig);
  }
}
