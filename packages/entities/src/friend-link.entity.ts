import { Column, Entity } from 'typeorm';
import { BlogBaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export enum FriendLinkState {
  padding,
  reject,
  resolve,
}

@Entity('friend_link')
export class FriendLinkEntity extends BlogBaseEntity {
  static readonly STATE = FriendLinkState;
  static readonly modelName = 'FriendLinkEntity' as const;

  @Column('varchar', { length: 100, comment: '站名' })
  name!: string;
  @Column('varchar', { length: 500, comment: '描述', nullable: true })
  desc?: string;
  @Column('varchar', { length: 254, comment: '链接', unique: true })
  link!: string;

  @Column('varchar', { length: 500, comment: '申请描述', nullable: true })
  applyDesc?: string;

  @Column('varchar', { length: 500, comment: '屏幕截图', nullable: true })
  screenshot!: string;

  @Column('varchar', {
    length: 500,
    comment: '头像',
    default: UserEntity.DEFAULT_AVATAR,
  })
  avatar!: string;

  @Column('enum', {
    enum: FriendLinkState,
    comment: '审核状态padding,reject,resolve,',
    default: FriendLinkState.padding,
    select: false,
  })
  status!: FriendLinkState;

  @Column('varchar', {
    length: 200,
    comment: '拒绝理由',
    nullable: true,
    select: false,
  })
  rejectReason?: string;

  @Column('varchar', {
    length: 45,
    comment: 'ip',
    nullable: true,
    select: false,
  })
  ip!: string | null;

  @Column('varchar', {
    length: 500,
    comment: '浏览器的user-agent',
    nullable: true,
    select: false,
  })
  ua!: string | null;

  @Column('varchar', {
    length: 500,
    comment: '邮箱',
    nullable: true,
    select: false,
  })
  email?: string;
}
