import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BlogBaseEntity } from './base.entity';
import { ProjectCategoryEntity } from './project-category.entity';
import { PROJECT_STATUS } from './constant';

@Entity('project')
export class ProjectEntity extends BlogBaseEntity {
  static readonly STATUS = PROJECT_STATUS;

  static override readonly modelName = 'ProjectEntity' as const;

  @Column('varchar', { length: 100, comment: '项目名称' })
  name!: string;

  @Column('varchar', { length: 500, comment: '项目描述', nullable: true })
  desc?: string;

  @Column('varchar', { length: 254, comment: '项目链接', unique: true, nullable: true })
  link?: string;

  @Column('varchar', { length: 500, comment: '项目封面' })
  cover!: string;

  @Column('enum', {
    enum: PROJECT_STATUS,
    comment: '项目状态Developing,Completed,Transferred,',
    default: PROJECT_STATUS.Developing,
  })
  status!: PROJECT_STATUS;

  @Column('varchar', { length: 500, comment: '转移到', nullable: true })
  transferredTo?: string;

  @Column('varchar', { length: 500, comment: '技术栈' })
  techStack?: string;

  @Column('int', { comment: '权重排序', default: 0 })
  weights?: number;

  @Column('datetime', { comment: '开始时间', default: () => 'CURRENT_TIMESTAMP' })
  startTime!: Date;

  @Column('datetime', { comment: '结束时间', nullable: true })
  endTime!: Date | null;

  @ManyToOne(() => ProjectCategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category!: ProjectCategoryEntity;

  @Column('int', { comment: '分类id', nullable: true })
  categoryId!: number | null;
}
