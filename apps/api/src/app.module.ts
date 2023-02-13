import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModModule } from './modules/test-mod/test-mod.module';
import dbConfig from '../config/db';

const msConf = dbConfig.mysql;
@Module({
  imports: [
    // 使用 TypeORM 配置数据库
    TypeOrmModule.forRoot({
      type: 'mysql',
      username: msConf.user,
      password: msConf.password,
      database: msConf.database,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 路径写错会找不到实体
      synchronize: true,
    }),
    TestModModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
