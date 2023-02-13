//获取ip（内网或外网）
import { IncomingMessage } from 'http';
import type { Buffer } from 'buffer';
import * as https from 'https';

export const getIp = function (http: IncomingMessage): string {
  const ipStr = http.headers['X-Real-IP'] || http.headers['x-forwarded-for'];
  if (ipStr) {
    const ipArr: string[] = Array.isArray(ipStr) ? ipStr : ipStr.split(',');
    if (ipArr && ipArr.length > 0) {
      //如果获取到的为ip数组
      return ipArr[0] as string;
    }
  }
  const ips = (http as any).ips as string[];
  const ip = (http as any).ip as string;
  //获取不到时
  return ips?.[0] ?? ip;
};

export function isDev(): boolean {
  // 本地运行是没有 process.env.NODE_ENV 的，借此来区分[开发环境]和[生产环境]
  console.log('env', process.env['NODE_ENV']);
  return !process.env['NODE_ENV'];
}

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

let mysqlConfig: {
  port: number;
  host: string;
  username: string;
  password: string;
  database: string;
};
export function getMYSQLConfig() {
  if (mysqlConfig) return mysqlConfig;
  mysqlConfig = {
    port: Number(process.env['MYSQL_PORT']),
    host: process.env['MYSQL_HOST'] as string,
    username: process.env['MYSQL_USERNAME'] as string,
    password: process.env['MYSQL_PASSWORD'] as string,
    database: process.env['MYSQL_DATABASE'] as string,
  };
  return mysqlConfig;
}
