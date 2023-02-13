import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'test-mod' })
export class TestModEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: 'id' })
  id!: number;

  // 创建时间
  @Column('datetime', {
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
    select: false,
  })
  createAt!: Date;

  // 更新时间
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '更新时间',
    select: false,
  })
  updateAt!: Date;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  desc!: string;
}
