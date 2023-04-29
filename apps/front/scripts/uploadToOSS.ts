import VitePluginOss from 'vite-plugin-oss';
import * as Path from 'path';
import Fs from 'fs';
import dotenv from 'dotenv';
import type { Env } from '../env';

// nuxt打包后vite钩子对不上，所以只能手动调用了

function readEnv(filename: string) {
  return dotenv.parse(Fs.readFileSync(Path.resolve(__dirname, '../' + filename), 'utf-8')) as any;
}

const env: Env = readEnv('.env.production');

const up = VitePluginOss({
  region: env.VITE_OSS_REGION,
  accessKeyId: env.VITE_OSS_ACCESSKEY_ID,
  accessKeySecret: env.VITE_OSS_ACCESS_KEY_SECRET,
  bucket: env.VITE_OSS_BUCKET,

  timeout: 60 * 60 * 24 * 365,
  from: Path.resolve(__dirname, '../.output/public/**'), // 上传那个文件或文件夹
  dist: '/blog-front/', // 需要上传到oss上的给定文件目录
  test: false, // 测试，可以在进行测试看上传路径是否正确, 打开后只会显示上传路径并不会真正上传。默认false
  // 因为文件标识符 "\"  和 "/" 的区别 不进行 setOssPath配置,上传的文件夹就会拼到文件名上, 丢失了文件目录,所以需要对setOssPath 配置。
  setOssPath: (filePath: string): string => {
    const key = 'public';
    const index = filePath.lastIndexOf(key);
    const Path = filePath.substring(index + key.length, filePath.length);
    return Path.replace(/\\/g, '/');
  },
});

up.configResolved?.({ build: { outDir: '../output/public' } } as any);
(up.closeBundle as any)();
