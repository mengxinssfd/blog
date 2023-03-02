import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV } from './utils/utils';
import { UserModule } from './modules/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import * as Entities from '@blog/entities';
import { ChatAiModule } from './modules/chat-ai/chat-ai.module';
import { CategoryModule } from '@/modules/category/category.module';
import { TagModule } from '@/modules/tag/tag.module';
import { ArticleModule } from '@/modules/article/article.module';
import { DailyImgModule } from '@/modules/daily-img/daily-img.module';
import { configLoader, Configuration } from '@/config/configuration';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { envValidate } from '@/env/env.validate';
import * as Path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: envValidate,
      load: [configLoader],
      envFilePath: ['.env.local', ...(ENV.isTest() ? ['.env.test'] : []), '.env'].map((file) =>
        Path.resolve(__dirname, './env/' + file),
      ), // 前面的会覆盖后面的
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // 使用 TypeORM 配置数据库
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => {
        return {
          ...configService.get<Configuration['database']>('database'),
          type: 'mysql',
          entities: Object.values(Entities),
          synchronize: ENV.isDev() || ENV.isTest(),
        } as MysqlConnectionOptions;
      },
    }),
    AuthModule,
    UserModule,
    ChatAiModule,
    CategoryModule,
    TagModule,
    ArticleModule,
    DailyImgModule,
  ],
})
export class AppModule {}
