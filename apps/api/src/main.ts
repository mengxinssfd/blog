import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENV } from './utils/utils';
import { iniApp } from '@/init-app';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  iniApp(app);

  // 线上环境不显示文档
  if (ENV.isDev()) {
    // 配置 Swagger
    const config = new DocumentBuilder()
      .addBearerAuth() // 开启 BearerAuth 授权认证
      .setTitle('Blog')
      .setDescription('The Blog API description')
      .setVersion('2.0')
      // .addTag('api')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    // 地址 /api-doc
    SwaggerModule.setup('api-doc', app, document);
  }

  // 不加hostname的话，当前地址访问获取不到ip
  // 参考 https://www.cnblogs.com/lpbottle/p/nodejs_get_ip.html
  await app.listen(3000, '0.0.0.0');
  // 不加hostname获取的ip => ::ffff:192.xxx.xxx.xxx
  // await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
