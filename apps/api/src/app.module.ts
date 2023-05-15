import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ENV } from '@/utils/utils';
import { UserModule } from '@/routers/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@/modules/auth/auth.module';
import * as Entities from '@blog/entities';
import { OpenaiModule } from '@/routers/openai/openai.module';
import { CategoryModule } from '@/routers/category/category.module';
import { TagModule } from '@/routers/tag/tag.module';
import { ArticleModule } from '@/routers/article/article.module';
import { DailyImgModule } from '@/routers/daily-img/daily-img.module';
import { configLoader } from '@/config/configuration';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { envValidate } from '@/env/env.validate';
import * as Path from 'path';
import { ArticleLikeModule } from '@/routers/article-like/article-like.module';
import { SharedModule } from '@/modules/shared/shared.module';
import { AppConfigService } from '@/app.config.service';
import { CommentModule } from '@/routers/comment/comment.module';
import { CommentLikeModule } from '@/routers/comment-like/comment-like.module';
import { CommentDislikeModule } from '@/routers/comment-dislike/comment-dislike.module';
import { FriendLinkModule } from '@/routers/friend-link/friend-link.module';
import { FileModule } from '@/routers/file/file.module';
import { StatisticsModule } from '@/routers/statistics/statistics.module';
import { RedisModule, type RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { InitModule } from '@/modules/init/init.module';
import { ProjectModule } from './routers/project/project.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: envValidate,
      load: [configLoader],
      envFilePath: (
        [
          ['.env.production', ENV.isDev() || ENV.isTest()],
          ['.env.local'],
          ['.env.test', !ENV.isTest()],
          ['.env'],
        ] satisfies Array<[string] | [string, boolean]>
      )
        .filter(([, disable]) => !disable)
        .map(([file]) => Path.resolve(__dirname, './env/' + file)), // 前面的会覆盖后面的
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // 使用 TypeORM 配置数据库
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => {
        return {
          ...configService.val('database'),
          type: 'mysql',
          entities: Object.values(Entities),
          synchronize: ENV.isDev() || ENV.isTest(),
        } as MysqlConnectionOptions;
      },
    }),
    RedisModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService): Promise<RedisModuleOptions> => {
        return { config: { ...configService.val('redis') } };
      },
    }),
    AuthModule,
    UserModule,
    OpenaiModule,
    CategoryModule,
    TagModule,
    ArticleModule,
    DailyImgModule,
    ArticleLikeModule,
    CommentModule,
    CommentLikeModule,
    CommentDislikeModule,
    FriendLinkModule,
    FileModule,
    StatisticsModule,
    InitModule,
    ProjectModule,
  ],
})
export class AppModule {}
