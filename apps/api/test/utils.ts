import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import * as request from 'supertest';
import { SuperTest } from 'supertest';
import { iniApp } from '@/init-app';
import * as Entities from '@blog/entities';

export function buildApp(cb?: (app: INestApplication) => void): () => SuperTest<request.Test> {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    iniApp(app);
    await app.init();

    await cb?.(app);
  });

  // 不加会报错
  afterAll(async () => {
    await Entities.UserEntity.getRepository()
      .manager.connection.createQueryRunner()
      .clearDatabase();
    await Entities.UserEntity.getRepository().manager.connection.destroy();
  });

  return () => request(app.getHttpServer());
}

export async function clearAllTables() {
  // 先暂时停掉外键约束检查，等清理完成才还原回来
  await Entities.UserEntity.getRepository().query('SET FOREIGN_KEY_CHECKS=0;');

  // await Entities.CommentDislikeEntity.clear();
  // await Entities.CommentLikeEntity.clear();
  // await Entities.CommentEntity.clear();
  await Entities.ArticleEntity.clear();
  // await Entities.ArticleLikeEntity.clear();
  await Entities.CategoryEntity.clear();
  await Entities.UserEntity.clear();
  await Entities.TagEntity.clear();

  await Entities.UserEntity.getRepository().query('SET FOREIGN_KEY_CHECKS=1;');
}
