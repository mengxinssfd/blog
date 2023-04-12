import { EnvironmentVariables } from '@/env/env.variables';

export const configLoader = () => {
  const env: EnvironmentVariables = process.env as any;
  return {
    oss: {
      region: env.OSS_REGION,
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: env.OSS_ACCESS_KEY_ID,
      accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
      bucket: env.OSS_BUCKET,
      cname: env.OSS_CNAME,
      endpoint: env.OSS_ENDPOINT,
    },
    openai: {
      apiKey: env.OPENAI_API_KEY,
    },
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
