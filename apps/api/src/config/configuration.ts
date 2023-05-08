import { EnvironmentVariables } from '@/env/env.variables';
import { plainToInstance } from 'class-transformer';

export const configLoader = () => {
  const env = plainToInstance(EnvironmentVariables, process.env, {
    enableImplicitConversion: true,
  });

  return {
    app: {
      port: env.APP_PORT,
      host: env.APP_HOST,
      name: env.APP_NAME,
      emailEnable: env.APP_EMAIL_ENABLE,
    },
    mail: {
      transport: {
        host: env.MAIL_HOST,
        port: env.MAIL_PORT,
        secure: env.MAIL_SECURE,
        auth: {
          user: env.MAIL_AUTH_USER,
          pass: env.MAIL_AUTH_PASS,
        },
      },
      defaults: {
        from: `"${env.APP_NAME}" <${env.MAIL_AUTH_USER}>`,
      },
    },
    redis: {
      host: env.REDIS_HOST || 'localhost',
      port: env.REDIS_PORT || 6379,
      password: env.REDIS_PASSWORD,
    },
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
      email: env.ROOT_EMAIL,
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
