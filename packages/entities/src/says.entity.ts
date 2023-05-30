import { BlogBaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';

export enum SaysStatus {
  Public,
  Login,
  Private,
}

@Entity({ name: 'says' })
export class SaysEntity extends BlogBaseEntity {
  static readonly modelName = 'SaysEntity' as const;
  static readonly STATUS = SaysStatus;

  constructor(partial?: Partial<SaysEntity>) {
    super();
    partial && Object.assign(this, partial);
  }

  @Column({
    type: 'text',
    comment: '说说内容',
    charset: 'utf8mb4',
  })
  content!: string;

  @Column('varchar', {
    length: 45,
    comment: 'ip',
    nullable: true,
    select: false,
  })
  ip!: string | null;

  @Column('varchar', {
    length: 100,
    comment: '地区',
    nullable: true,
  })
  region!: string | null;

  @Column('varchar', {
    length: 50,
    comment: '浏览器',
    nullable: true,
  })
  browser!: string | null;

  @Column('varchar', {
    length: 50,
    comment: '系统',
    nullable: true,
  })
  os!: string | null;

  @Column('varchar', {
    length: 500,
    comment: '浏览器的user-agent',
    nullable: true,
    select: false,
  })
  ua!: string | null;

  @Column('enum', {
    enum: SaysStatus,
    comment: `状态：${SaysStatus.Public} 公开，${SaysStatus.Login} 需要登录, ${SaysStatus.Private} 只能自己看`,
    default: SaysStatus.Public,
  })
  status!: SaysStatus;

  @Column('datetime', { nullable: true, comment: `过期时间` })
  expires!: Date | null;
}
