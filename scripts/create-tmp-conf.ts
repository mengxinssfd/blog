import FSE from 'fs-extra';
import Path from 'path';
import * as Chalk from 'chalk';

const cwd = process.cwd();

const files = ['tmp/mysql/conf/my.cnf', 'tmp/redis/redis.conf'].map((item) =>
  Path.resolve(cwd, item),
);

files.forEach((item) => {
  if (FSE.existsSync(item)) return;
  console.log(Chalk.green('创建文件 ' + item));
  FSE.createFileSync(item);
});
