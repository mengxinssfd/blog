import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getMYSQLConfig } from './utils/utils';
import { UserModule } from './modules/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UserEntity } from '@blog/entities';

const cm = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'], // 前面的会覆盖后面的
});

@Module({
  imports: [
    cm,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // 使用 TypeORM 配置数据库
    TypeOrmModule.forRoot({
      ...getMYSQLConfig(),
      type: 'mysql',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'], // 路径写错会找不到实体
      entities: [UserEntity],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
