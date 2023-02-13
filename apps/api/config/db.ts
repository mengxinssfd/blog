import { isDev } from '../src/utils/utils';

const productConfig = {
  mysql: {
    port: 3306,
    host: 'localhost',
    user: 'admin',
    password: '123456',
    database: 'blog', // 库名
    connectionLimit: 10, // 连接限制
  },
};

const localConfig = {
  mysql: {
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'blog', // 库名
    connectionLimit: 10, // 连接限制
  },
};

const config = isDev() ? productConfig : localConfig;

export default config;
