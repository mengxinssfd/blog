import originPkg from '../package.json';
import * as Path from 'path';
import fs from 'fs';

function apiRoot(path = '') {
  return Path.resolve(__dirname, '../' + path);
}

function getDistFiles(files: string[]): string[] {
  return files.filter((f) => !/(\.d\.ts|\.js\.map|\.tsbuildinfo)$/.test(f));
}

function copyDeps(originPath: string, name: string) {
  originPath = Path.resolve(__dirname, '../' + originPath);
  const newPath = Path.resolve(__dirname, '../dist/' + name);
  const newPathDist = Path.resolve(newPath, 'dist');
  const originPathDist = Path.resolve(originPath + '/dist');

  if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
  if (!fs.existsSync(newPathDist)) fs.mkdirSync(newPathDist);

  const distFiles = getDistFiles(fs.readdirSync(originPathDist));
  distFiles.forEach((f) => {
    fs.cpSync(Path.resolve(originPathDist, f), Path.resolve(newPathDist, f));
  });

  fs.cpSync(Path.resolve(originPath, 'package.json'), Path.resolve(newPath, 'package.json'));
}

/**
 * build以后在dist生成package.json
 */
function buildPkg() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete originPkg.devDependencies;

  originPkg.scripts['start:prod'] = 'node src/main.js';

  // 复制 packages/*
  Object.entries(originPkg.dependencies)
    .filter((v) => v[0].startsWith('@blog/'))
    .forEach(([k, v]) => {
      const name = k.replace('@blog/', '');
      originPkg.dependencies[k] = './' + name;
      copyDeps(v, name);
    });

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
