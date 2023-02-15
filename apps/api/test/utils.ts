import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { TransformInterceptor } from '@/interceptors/transform/transform.interceptor';
import { AnyExceptionFilter } from '@/filters/any-exception/any-exception.filter';
import { HttpExceptionFilter } from '@/filters/http-exception/http-exception.filter';

export function iniApp(app: INestApplication) {
  app.setGlobalPrefix('api'); // /api 开头
  app.enableCors(); // 跨域
  app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

  app.useGlobalInterceptors(new TransformInterceptor());
  // 注意：AllExceptionsFilter 要在 HttpExceptionFilter 的上面，
  // 否则 HttpExceptionFilter 就不生效了，全被 AllExceptionsFilter 捕获了。
  app.useGlobalFilters(new AnyExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
}

export function buildApp(cb: (app: INestApplication) => void) {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    iniApp(app);
    await app.init();

    cb(app);
  });

  afterEach(() => {
    app.close();
  });
}
