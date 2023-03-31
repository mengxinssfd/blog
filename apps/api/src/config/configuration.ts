import { EnvironmentVariables } from '@/env/env.variables';

export const configLoader = () => {
  const env: EnvironmentVariables = process.env as any;
  return {
    admin: {
      username: env.ROOT_USERNAME,
      password: env.ROOT_PASSWORD,
    },
    database: {
      port: Number(env.MYSQL_PORT),
      host: env.MYSQL_HOST,
      username: env.MYSQL_USERNAME,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
    },
  } as const;
};

export type Configuration = ReturnType<typeof configLoader>;
