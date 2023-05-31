import { Injectable } from '@nestjs/common';
import {
  CreateProjectCategoryDto,
  ListProjectCategoryDto,
  UpdateProjectCategoryDto,
} from '@blog/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectCategoryEntity, ProjectEntity } from '@blog/entities';
import { Repository } from 'typeorm';
import { PageVo } from '@blog/dtos/page.vo';
import { PageDto } from '@blog/dtos/page.dto';

enum Alias {
  ProjectCategory = 'ProjectCategory',
}
type Prop = `${Alias.ProjectCategory}.${keyof ProjectCategoryEntity}`;

@Injectable()
export class ProjectCategoryService {
  constructor(
    @InjectRepository(ProjectCategoryEntity)
    private readonly rep: Repository<ProjectCategoryEntity>,
  ) {}
  async create(createProjectCategoryDto: CreateProjectCategoryDto) {
    const entity = new ProjectCategoryEntity({ ...createProjectCategoryDto });
    await this.rep.save(entity);
  }

  async findAll(dto: ListProjectCategoryDto): Promise<PageVo<ProjectCategoryEntity>> {
    const alias = Alias.ProjectCategory;
    const builder = this.rep
      .createQueryBuilder(alias)
      // .addSelect([`${alias}.createAt`] satisfies Prop[])
      .orderBy(`${alias}.weights` satisfies Prop, 'DESC');

    if (!dto.pure) {
      builder
        .leftJoinAndSelect(`${alias}.projectList` satisfies Prop, 'project')
        .addOrderBy('project.weights' satisfies `project.${keyof ProjectEntity}`, 'DESC');
    }

    const [list, count] = await builder.getManyAndCount();
    return { count, list };
  }
  async findAllByAdmin(dto: PageDto): Promise<PageVo<ProjectCategoryEntity>> {
    const alias = Alias.ProjectCategory;
    const builder = this.rep
      .createQueryBuilder(alias)
      .addSelect([`${alias}.createAt`, `${alias}.deletedAt`] satisfies Prop[])
      .orderBy(`${alias}.weights` satisfies Prop, 'DESC')
      .offset((dto.page - 1) * dto.pageSize)
      .limit(dto.pageSize)
      .withDeleted();
    const [list, count] = await builder.getManyAndCount();
    return { count, list };
  }

  async update(id: number, updateProjectCategoryDto: UpdateProjectCategoryDto) {
    const entity = new ProjectCategoryEntity({ ...updateProjectCategoryDto, id });
    await this.rep.save(entity);
  }

  async remove(id: number) {
    const res = await this.rep.softDelete(id);
    return { affected: res.affected };
  }

  async restore(id: number) {
    const res = await this.rep.restore(id);
    return { affected: res.affected };
  }
}
