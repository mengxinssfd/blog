import Path from 'path';
import { readEnv, setEnvValue } from './utils';
import Fs from 'fs';
import { EnvironmentVariables } from '../../apps/api/src/env/env.variables';
import { Env } from '../../apps/front/env';
import * as yaml from 'js-yaml';
import { DockerCompose } from '../templates/docker-compose';
import * as Chalk from 'chalk';

const rootDir = Path.resolve(__dirname, '../../');
const deployDir = Path.resolve(rootDir, 'deploy');
const templatesDir = Path.resolve(deployDir, 'templates');
const tmpDir = Path.resolve(deployDir, 'tmp');
const apiDir = Path.resolve(rootDir, 'apps/api');
const frontDir = Path.resolve(rootDir, 'apps/front');

const apiEnv = readEnv<Record<keyof EnvironmentVariables, string>>(Path.resolve(apiDir, 'src/env'));
const frontEnv = readEnv<Env>(frontDir);

(() => {
  handleEnv();
  handlePm2Config();
  handleDockerfile();
  handleDockerCompose();
  handleNginxConf();
})();

function handleEnv() {
  const apiEnvDir = Path.resolve(apiDir, 'dist/env');

  setEnvValue(Path.resolve(apiEnvDir, '.env.production'), [
    // setEnvValue(Path.resolve(apiEnvDir, '.env.local'), [
    ['MYSQL_HOST', 'blog_mysql_1'],
    ['REDIS_HOST', 'blog_redis_1'],
  ]);
}

function handlePm2Config() {
  const config = require('../templates/pm2.config.js');

  const apiConfig = config.apps[0];
  const frontConfig = config.apps[1];
  frontConfig.env = Object.assign({}, frontEnv);

  apiConfig.env.PORT = apiEnv.APP_PORT;
  apiConfig.env.ORIGIN_ADDR = apiEnv.APP_HOST;

  const resPath = Path.resolve(tmpDir, 'pm2.config.js');
  console.log(Chalk.cyan(`生成 ${resPath}`));
  Fs.writeFileSync(resPath, `module.exports = ${JSON.stringify(config, null, 2)}`);
}

function handleDockerfile() {
  let dockerFile = Fs.readFileSync(Path.resolve(templatesDir, 'apps.Dockerfile'), 'utf-8');
  dockerFile += `\nEXPOSE ${apiEnv.APP_PORT} ${frontEnv.NITRO_PORT}`;

  const resPath = Path.resolve(rootDir, 'Dockerfile');
  console.log(Chalk.cyan(`生成 ${resPath}`));
  Fs.writeFileSync(resPath, dockerFile);
  Fs.copyFileSync(
    Path.resolve(templatesDir, 'nginx.Dockerfile'),
    Path.resolve(deployDir, 'nginx/Dockerfile'),
  );
}

function handleDockerCompose() {
  const config = yaml.load(
    Fs.readFileSync(Path.resolve(templatesDir, 'docker-compose.yml'), 'utf8'),
  ) as DockerCompose;

  const {
    services: { mysql, redis, apps },
  } = config;

  console.log(Chalk.green(`拼接 docker-compose`));

  apps.ports = [
    `${apiEnv.APP_PORT}:${apiEnv.APP_PORT}`,
    `${frontEnv.NITRO_PORT}:${frontEnv.NITRO_PORT}`,
  ];

  mysql.ports[0] = `${apiEnv.MYSQL_PORT}:${apiEnv.MYSQL_PORT}`;
  mysql.environment.MYSQL_DATABASE = apiEnv.MYSQL_DATABASE;
  mysql.environment.MYSQL_USER = apiEnv.MYSQL_USERNAME;
  mysql.environment.MYSQL_PASSWORD = apiEnv.MYSQL_PASSWORD;
  mysql.environment.MYSQL_ROOT_PASSWORD = apiEnv.MYSQL_PASSWORD;

  redis.ports[0] = `${apiEnv.REDIS_PORT}:${apiEnv.REDIS_PORT}`;

  const resPath = Path.resolve(rootDir, 'docker-compose.yml');
  console.log(Chalk.cyan(`生成 ${resPath}`));
  Fs.writeFileSync(resPath, yaml.dump(config));
}

function handleNginxConf() {
  const filename = 'nginx.conf';
  const configPath = Path.resolve(templatesDir, filename);

  console.log(Chalk.green(`nginx替换\${host}`));
  let conf = Fs.readFileSync(configPath, 'utf-8');
  conf = conf.replace(/\$\{host}/g, apiEnv.APP_HOST);

  console.log(Chalk.green(`nginx替换\${frontPort}`));
  conf = conf.replace(/\$\{frontPort}/g, frontEnv.NITRO_PORT);

  console.log(Chalk.green(`nginx替换\${apiPort}`));
  conf = conf.replace(/\$\{apiPort}/g, apiEnv.APP_PORT);

  const resPath = Path.resolve(deployDir, 'nginx/' + filename);
  console.log(Chalk.cyan(`生成 ${resPath}`));
  Fs.writeFileSync(resPath, conf);
}
