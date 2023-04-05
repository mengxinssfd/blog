import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
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

  @Column('varchar', { length: 20, comment: '站名', unique: true })
  name!: string;
  @Column('varchar', { length: 254, comment: '描述', nullable: true })
  desc?: string;
  @Column('varchar', { length: 254, comment: '链接', unique: true })
  link!: string;

  @Column('varchar', {
    length: 500,
    comment: '头像',
    default: UserEntity.DEFAULT_AVATAR,
  })
  avatar!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createBy' })
  owner!: UserEntity;

  @Column('int', {
    comment: '创建人id',
    select: false,
  })
  createBy!: number;

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
}
