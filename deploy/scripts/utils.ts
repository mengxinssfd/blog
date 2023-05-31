import Fs from 'fs';
import * as Path from 'path';
import dotenv from 'dotenv';

export function setEnvValue(
  envPath: string,
  replaceList: [key: string, value: string | ((value: string) => string)][],
) {
  let envContent = Fs.readFileSync(envPath, 'utf-8');

  replaceList.forEach(([key, value]) => {
    const reg = new RegExp(`^${key}="?([^\n"]+)"?$`, 'm');
    if (reg.test(envContent)) {
      const val = RegExp.$1;
      const replaceValue = typeof value === 'string' ? value : value(val);
      envContent = envContent.replace(val, replaceValue);
    } else {
      envContent += `\n${key}="${typeof value === 'string' ? value : value('')}"`;
    }
  });

  Fs.writeFileSync(envPath, envContent);
}

export function readEnv<T>(envDir: string): T {
  function readFile(path: string) {
    const _path = Path.resolve(envDir, path);
    if (!Fs.existsSync(_path)) return '';
    return Fs.readFileSync(_path, 'utf-8');
  }
  const env = readFile('.env');
  const envProduction = readFile('.env.production');

  return Object.assign(dotenv.parse(env), dotenv.parse(envProduction)) as T;
}
