import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModModule } from './modules/test-mod/test-mod.module';
import { getMYSQLConfig } from '../config/db';

const cm = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'], // 前面的会覆盖后面的
});

@Module({
  imports: [
    cm,
    // 使用 TypeORM 配置数据库
    TypeOrmModule.forRoot({
      ...getMYSQLConfig(),
      type: 'mysql',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 路径写错会找不到实体
      synchronize: true,
    }),
    TestModModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
