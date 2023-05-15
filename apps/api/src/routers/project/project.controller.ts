import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from '@blog/dtos/project';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { ProjectEntity } from '@blog/entities';
import { Action } from '@blog/permission-rules';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Create, ProjectEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.projectService.findOne(+id);
  // }

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, ProjectEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(+id, dto);
  }

  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, ProjectEntity.modelName))
  @UseGuards(CaslAbilityFactory)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
