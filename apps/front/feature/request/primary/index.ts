import { createUUID } from '@tool-pack/basic';
import type { Context } from 'request-template';
import { AxiosRequestTemplate } from '@request-template/axios';
import { ElLoading } from 'element-plus';
import axios from 'axios';
import { statusHandlers } from './statusHandlers';
import { Token } from './token';
import { type PrimaryCustomConfig, setRequestIns } from '@blog/apis';

AxiosRequestTemplate.useAxios(axios);

export class PrimaryRequest<
  CC extends PrimaryCustomConfig = PrimaryCustomConfig,
> extends AxiosRequestTemplate<CC> {
  static ins = new PrimaryRequest();
  private loading?: ReturnType<(typeof ElLoading)['service']>;

  private constructor() {
    const env = import.meta.env;
    super({
      requestConfig: { baseURL: process.server ? env.VITE_BASE_URL_LOCAL : env.VITE_BASE_URL },
      customConfig: {
        statusHandlers,
        cache: { enable: false, timeout: 60 * 1000 },
        // TODO 以后要改为undefined，非get请求就不需要写showSuccessMsg
        showSuccessMsg: false,
      } as CC,
    });
  }

  // use $fetch
  /* protected init() {
    this.cache = new Cache();
  }

  protected isCancel() {
    return false;
  }

  protected fetch(ctx) {
    const baseConfig = this.globalConfigs.requestConfig;
    const config = ctx.requestConfig;

    const method = config.method || baseConfig.method;
    return $fetch((config.baseURL || baseConfig.baseURL) + (config.url || baseConfig.url), {
      method,
      params: { ...baseConfig.data, ...config.data },
      headers: { ...baseConfig.headers, ...config.headers },
      // baseURL: config.baseURL || baseConfig.baseURL,
      body:
        !method || method.toLowerCase() === 'get'
          ? undefined
          : { ...baseConfig.data, ...config.data },
      onResponse({ response }) {
        response._data = {
          data: response._data,
          status: response.status,
          headers: response.headers,
        };
        return Promise.resolve();
      },
      onRequestError(ctx) {
        console.log(ctx);
        return Promise.resolve();
      },
    }) as any;
  } */

  protected handleCustomConfig(customConfig: CC): CC {
    if (customConfig.successMsg && customConfig.showSuccessMsg === undefined)
      customConfig.showSuccessMsg = true;
    return super.handleCustomConfig(customConfig);
  }

  protected beforeRequest(ctx: Context<CC>) {
    // 复用基础模板逻辑
    super.beforeRequest(ctx);
    if (process.client && ctx.customConfig.loading) {
      this.loading = ElLoading.service();
    }

    // 未设置showSuccessMsg时，且非get请求则全部显示请求成功信息
    if (ctx.requestConfig.method !== 'get' && ctx.customConfig.showSuccessMsg === undefined) {
      ctx.customConfig.showSuccessMsg = true;
    }
  }

  // 关闭loading
  protected afterRequest(ctx: Context<CC>) {
    super.afterRequest(ctx); // 复用基础模板逻辑
    // 加个定时器避免请求太快，loading一闪而过
    setTimeout(() => {
      this.loading?.close();
    }, 200);
  }

  // 生成uuid
  private static getUUID() {
    const uuid = useCookie('uuid', { expires: new Date(2030, 1, 1) });
    if (!uuid.value) uuid.value = createUUID();
    return uuid.value;
  }

  // 处理config，添加uuid和token到headers
  protected override handleRequestConfig(requestConfig: any) {
    if (!requestConfig.headers) requestConfig.headers = {};
    Token.exists() && (requestConfig.headers.authorization = `Bearer ${Token.get()}`);
    requestConfig.headers.uuid = PrimaryRequest.getUUID();
    return super.handleRequestConfig(requestConfig);
  }
}

setRequestIns(PrimaryRequest.ins);
