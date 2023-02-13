import originPkg from '../package.json';
import * as Path from 'path';
import fs from 'fs';

function apiRoot(path = '') {
  return Path.resolve(__dirname, '../' + path);
}

/**
 * build以后在dist生成package.json
 */
function buildPkg() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete originPkg.devDependencies;

  originPkg.scripts['start:prod'] = 'node src/main.js';

  const content = JSON.stringify(originPkg, null, 2);
  const path = apiRoot('dist/package.json');
  fs.writeFileSync(path, content);
}

/**
 * 复制.env文件
 */
function cpEnvFile() {
  const list = fs.readdirSync(apiRoot());
  const envs = list.filter((f) => f.startsWith('.env'));
  envs.forEach((env) => fs.cpSync(apiRoot(env), apiRoot('dist/' + env)));
}

async function run() {
  buildPkg();
  cpEnvFile();
}

run();
