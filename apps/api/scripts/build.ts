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
  const pkg = {
    name: originPkg.name,
    version: '0.0.1',
    private: true,
    scripts: { 'start:prod': 'node main.js' },
    dependencies: originPkg.dependencies,
  };

  const content = JSON.stringify(pkg, null, 2);
  const path = apiRoot('dist/package.json');
  fs.writeFileSync(path, content);
}

/**
 * 复制.env文件
 */
// function cpEnvFile() {
//   const list = fs.readdirSync(apiRoot());
//   const envs = list.filter((f) => f.startsWith('.env') && !f.includes('test'));
//   envs.forEach((env) => fs.cpSync(apiRoot(env), apiRoot('dist/' + env)));
// }

async function run() {
  buildPkg();
  // cpEnvFile();
}

run();
