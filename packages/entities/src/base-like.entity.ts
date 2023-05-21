import { Column, JoinColumn, ManyToOne, VersionColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BlogBaseEntity } from './base.entity';
// 点赞
export class BaseLikeEntity extends BlogBaseEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column('int', { comment: '点赞人id', nullable: true })
  userId!: number;

  // 更新次数
  @VersionColumn({ comment: '更新次数' })
  version!: number;

  @Column('varchar', {
    length: '255,255,255,255'.length,
    comment: '游客ip',
    nullable: true,
  })
  touristIp!: string;
}
