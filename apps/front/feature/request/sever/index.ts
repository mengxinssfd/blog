import { AxiosRequestTemplate } from '@request-template/axios';
import axios from 'axios';
import { PrimaryCustomConfig } from '@blog/apis';

AxiosRequestTemplate.useAxios(axios);

export class ServerRequest<
  CC extends PrimaryCustomConfig = PrimaryCustomConfig,
> extends AxiosRequestTemplate<CC> {
  static ins = new ServerRequest();
  private onceHeader: [name: string, value: string] | undefined;

  private constructor() {
    super({
      requestConfig: { baseURL: import.meta.env.VITE_BASE_URL },
      customConfig: {
        cache: { enable: false, timeout: 60 * 1000 },
      } as CC,
    });
  }

  addHeaderOnce(header: [name: string, value: string]) {
    this.onceHeader = header;
  }

  // 处理config，添加uuid和token到headers
  protected override handleRequestConfig(requestConfig: any) {
    if (!requestConfig.headers) requestConfig.headers = {};
    requestConfig.headers.Referer = 'from front server api';
    if (this.onceHeader) {
      requestConfig.headers[this.onceHeader[0]] = this.onceHeader[1];
      this.onceHeader = undefined;
    }
    return super.handleRequestConfig(requestConfig);
  }
}
