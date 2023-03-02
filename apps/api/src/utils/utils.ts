//获取ip（内网或外网）
import { IncomingMessage } from 'http';
import type { Buffer } from 'buffer';
import * as https from 'https';

export const getIp = function (http: IncomingMessage): string {
  const headers = http.headers;
  // X-Forwarded-For
  // 记录代理服务器的地址，每经过一个代理，该字段会加上一个记录，由于是记录来源地址，所以该字段不会保存最后一个代理 服务器的地址
  // - 存储客户端 ip 和反向代理 IP 列表，以逗号+空格分隔
  // - 记录最后直连实际服务器之前的整个代理过程
  // - 可能会被伪造 ip，但是直连实际服务器这段不会被伪造

  // X-Real-IP
  // 也是用来记录服务器的地址，但是和上面的不同，它不把记录添加到结尾，而是直接替换
  // - 请求实际服务器的 IP
  // - 每过一层 代理 都会被覆盖掉，只需第一层设置 代理
  // - IP可以被伪造，但如果存在一级以上的 代理，它就不会收到影响，因为每经过一次代理，它就会被覆盖

  // 原字段http.rawHeaders：X-Forwarded-For X-Real-IP
  const realIp = headers['x-real-ip'] as string;
  if (realIp) return realIp;

  const forwardedForIp = (headers['x-forwarded-for'] as string)?.split(',')?.at(-1);
  if (forwardedForIp) return forwardedForIp;

  const ips = (http as any).ips as string[];
  const ip = (http as any).ip as string;
  //获取不到时
  return ips?.[0] ?? ip;
};

export const ENV = {
  isDev(): boolean {
    // 本地运行是没有 process.env.NODE_ENV 的，借此来区分[开发环境]和[生产环境]
    // 生产环境下也是需要自己手动配置的，不会有自带该环境变量
    const env = process.env['NODE_ENV'];
    console.log('env', env);
    return env === 'development';
  },
  isTest(): boolean {
    // test是nest配置的，e2e测试时会变成test
    const env = process.env['NODE_ENV'];
    return env === 'test';
  },
};

export function httpsGet<T>(url: string): Promise<T> {
  return new Promise<any>((resolve, reject) => {
    https
      .get(url, (res) => {
        const bufferList: Buffer[] = [];
        res.on('data', (d) => {
          bufferList.push(d);
        });
        res.on('end', () => {
          if (!res.complete) {
            reject('The connection was terminated while the message was still being sent');
            return;
          }

          let json = '';
          try {
            json = JSON.parse(bufferList.map((i) => i.toString()).join(''));
          } catch (e) {
            resolve(reject('数据不是json'));
          }
          resolve(resolve(json));
        });
      })
      .on('error', (e) => {
        reject(e.message);
      });
  });
}
