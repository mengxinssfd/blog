import { Module } from '@nestjs/common';
import { ProjectCategoryService } from './project-category.service';
import { ProjectCategoryController } from './project-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectCategoryEntity } from '@blog/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectCategoryEntity])],
  controllers: [ProjectCategoryController],
  providers: [ProjectCategoryService],
})
export class ProjectCategoryModule {}
