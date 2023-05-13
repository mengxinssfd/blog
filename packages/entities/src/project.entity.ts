import { Column, Entity } from 'typeorm';
import { BlogBaseEntity } from './base.entity';

// state和status的区别
// state通常包含多类状态，内部可包含开发状态，维护状态等等；类似vue的reactive
// status则代表单一状态，像下面的项目状态就是单一的

export enum ProjectStatus {
  // 开发中
  Developing,
  // 已完成
  Completed,
  // 已转移
  Transferred,
}

@Entity('project')
export class ProjectEntity extends BlogBaseEntity {
  static readonly STATUS = ProjectStatus;

  static readonly modelName = 'ProjectEntity' as const;

  @Column('varchar', { length: 100, comment: '项目名称' })
  name!: string;

  @Column('varchar', { length: 500, comment: '项目描述', nullable: true })
  desc?: string;

  @Column('varchar', { length: 254, comment: '项目链接', unique: true })
  link!: string;

  @Column('varchar', { length: 500, comment: '项目封面' })
  cover!: string;

  @Column('enum', {
    enum: ProjectStatus,
    comment: '项目状态Developing,Completed,Transferred,',
    default: ProjectStatus.Developing,
  })
  status!: ProjectStatus;

  @Column('varchar', { length: 500, comment: '转移到', nullable: true })
  transferredTo?: string;

  @Column('varchar', { length: 500, comment: '技术栈' })
  techStack?: string;

  @Column('int', { comment: '权重排序', default: 0 })
  weights?: number;
}
