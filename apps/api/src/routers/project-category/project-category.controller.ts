import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProjectCategoryService } from './project-category.service';
import {
  CreateProjectCategoryDto,
  ListProjectCategoryDto,
  UpdateProjectCategoryDto,
} from '@blog/dtos';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { Action } from '@blog/permission-rules';
import { ProjectCategoryEntity } from '@blog/entities';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { PageDto } from '@blog/dtos/page.dto';

@Controller('project-category')
export class ProjectCategoryController {
  constructor(private readonly projectCategoryService: ProjectCategoryService) {}

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Create, ProjectCategoryEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Post()
  create(@Body() createProjectCategoryDto: CreateProjectCategoryDto) {
    return this.projectCategoryService.create(createProjectCategoryDto);
  }

  @Get()
  findAll(@Query() dto: ListProjectCategoryDto) {
    return this.projectCategoryService.findAll(dto);
  }

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, ProjectCategoryEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Get('admin')
  findAllByAdmin(@Query() dto: PageDto) {
    return this.projectCategoryService.findAllByAdmin(dto);
  }

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, ProjectCategoryEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectCategoryDto: UpdateProjectCategoryDto,
  ) {
    return this.projectCategoryService.update(id, updateProjectCategoryDto);
  }

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, ProjectCategoryEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectCategoryService.remove(id);
  }

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, ProjectCategoryEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.projectCategoryService.restore(id);
  }
}
