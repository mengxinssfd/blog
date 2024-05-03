import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BlogBaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { MEMORY_STATUS } from './constant';

@Entity('memory_helper')
export class MemoryHelperEntity extends BlogBaseEntity {
  static readonly STATUS = MEMORY_STATUS;
  static override readonly modelName = 'MemoryHelperEntity' as const;

  @Column('varchar', {
    length: 100,
    nullable: false,
    comment: '标题',
  })
  title!: string;

  @Column('varchar', {
    length: 500,
    nullable: true,
    comment: '描述',
  })
  desc?: string;

  @Column('longtext', {
    nullable: false,
    comment: '问题json',
  })
  questionJson!: string;

  @Column('int', { comment: '创建人id' })
  creatorId!: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'creatorId' })
  creator!: UserEntity;

  @Column('enum', {
    enum: MEMORY_STATUS,
    default: MEMORY_STATUS.Public,
    comment: '状态：0：公开,1：只能自己看',
  })
  status!: MEMORY_STATUS;
}

export interface MemoryHelperQuestion {
  question: string;
  answer: string;
  desc?: string;
  isUnChecked?: boolean;
  isMark?: boolean;
}
export class MemoryHelperEntityResolved extends MemoryHelperEntity {
  questionList!: MemoryHelperQuestion[];
}
