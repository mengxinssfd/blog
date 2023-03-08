import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity, UserEntity, CategoryEntity } from '@blog/entities';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, ArticleEntity, UserEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
