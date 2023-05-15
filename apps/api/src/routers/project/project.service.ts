import { Injectable } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from '@blog/dtos/project';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from '@blog/entities';
import { Repository } from 'typeorm';
import { PageVo } from '@blog/dtos/page.vo';

type Prop<Alias extends string = 'project'> = `${Alias}.${keyof ProjectEntity}`;

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly rep: Repository<ProjectEntity>,
  ) {}
  create(dto: CreateProjectDto) {
    const p = new ProjectEntity();
    Object.assign(p, dto);
    return this.rep.save(p);
  }
  async findAll(): Promise<PageVo<ProjectEntity>> {
    const [list, count] = await this.rep
      .createQueryBuilder('project')
      .orderBy('project.weights' satisfies Prop, 'DESC')
      .getManyAndCount();
    return { list, count };
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, dto: UpdateProjectDto) {
    const p = new ProjectEntity();
    p.id = id;
    Object.assign(p, dto);
    return this.rep.save(p);
  }

  remove(id: number) {
    this.rep.softDelete(id);
  }
}
