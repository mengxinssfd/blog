import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { logger } from '@/middlewares/logger/logger.middleware';
import { TransformInterceptor } from '@/interceptors/transform/transform.interceptor';
import { AnyExceptionFilter } from '@/filters/any-exception/any-exception.filter';
import { HttpExceptionFilter } from '@/filters/http-exception/http-exception.filter';
import { CaslForbiddenErrorExceptionFilter } from '@/filters/casl-forbidden-error-exception.filter';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

/**
 * 由于真实环境和e2e测试环境都需要初始化配置，
 * 所以从main.ts中提取出来初始化代码部分，避免重复编码；
 *
 * 为什么不放main.ts: 因为main.ts内部是自调用的，导出的同时也会启动
 */
export function iniApp(app: INestApplication) {
  app.setGlobalPrefix('api'); // /api 开头
  app.enableCors(); // 跨域
  app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // param转换类型
      whitelist: true, // 删除dto中未声明的变量
    }),
  );

  app.use(logger);
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.useGlobalInterceptors(new TransformInterceptor());
  // 注意：AllExceptionsFilter 要在 HttpExceptionFilter 的上面，
  // 否则 HttpExceptionFilter 就不生效了，全被 AllExceptionsFilter 捕获了。
  app.useGlobalFilters(new AnyExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new CaslForbiddenErrorExceptionFilter());
}
