import { Column, Entity, OneToMany } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { BlogBaseEntity } from './base.entity';

@Entity('project_category')
export class ProjectCategoryEntity extends BlogBaseEntity {
  static readonly modelName = 'ProjectCategoryEntity' as const;

  constructor(partial?: Partial<ProjectCategoryEntity>) {
    super();
    partial && Object.assign(this, partial);
  }

  @Column('varchar', { length: 24, comment: '分类名', unique: true })
  name!: string;

  @Column('varchar', { length: 255, comment: '描述', nullable: true })
  desc!: string | null;

  @Column('int', { comment: '权重排序', default: 0 })
  weights!: number;

  @OneToMany(() => ProjectEntity, (p) => p.category)
  projectList?: ProjectEntity[];
}
