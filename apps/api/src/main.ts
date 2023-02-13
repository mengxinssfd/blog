import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { logger } from './middlewares/logger/logger.middleware';
import { HttpExceptionFilter } from './filters/http-exception/http-exception.filter';
import { AnyExceptionFilter } from './filters/any-exception/any-exception.filter';
import { TransformInterceptor } from './interceptors/transform/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isDev } from './utils/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // /api 开头
  app.enableCors(); // 跨域
  app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

  app.use(logger);
  app.useGlobalInterceptors(new TransformInterceptor());
  // 注意：AllExceptionsFilter 要在 HttpExceptionFilter 的上面，
  // 否则 HttpExceptionFilter 就不生效了，全被 AllExceptionsFilter 捕获了。
  app.useGlobalFilters(new AnyExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 线上环境不显示文档
  if (isDev()) {
    // 配置 Swagger
    const options = new DocumentBuilder()
      .addBearerAuth() // 开启 BearerAuth 授权认证
      .setTitle('Blog')
      .setDescription('The Blog API description')
      .setVersion('2.0')
      .addTag('api')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    // 地址 /api-doc
    SwaggerModule.setup('api-doc', app, document);
  }

  // 不加hostname的话，当前地址访问获取不到ip
  // 参考 https://www.cnblogs.com/lpbottle/p/nodejs_get_ip.html
  await app.listen(3000, '0.0.0.0');
  // 不加hostname获取的ip => ::ffff:192.xxx.xxx.xxx
  // await app.listen(3000);
}
bootstrap();
