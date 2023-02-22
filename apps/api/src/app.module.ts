import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ENV, getMYSQLConfig } from './utils/utils';
import { UserModule } from './modules/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import {
  ArticleEntity,
  CategoryEntity,
  CommentDislikeEntity,
  CommentEntity,
  CommentLikeEntity,
  UserEntity,
  ArticleLikeEntity,
} from '@blog/entities';
import { ChatAiModule } from './modules/chat-ai/chat-ai.module';
import { CategoryModule } from '@/modules/category/category.module';

const cm = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', ...(ENV.isTest() ? ['.env.test'] : []), '.env'], // 前面的会覆盖后面的
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
      entities: [
        UserEntity,
        CategoryEntity,
        ArticleLikeEntity,
        CommentEntity,
        CommentLikeEntity,
        CommentDislikeEntity,
        ArticleEntity,
      ],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    ChatAiModule,
    CategoryModule,
  ],
})
export class AppModule {}
