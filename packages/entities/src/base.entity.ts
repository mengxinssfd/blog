import {
  BaseEntity,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class BlogBaseEntity extends BaseEntity {
  static readonly modelName: string;

  @PrimaryGeneratedColumn({ comment: 'id' })
  id!: number;

  // 创建时间
  @Column('datetime', {
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
    // 转换为时间戳
    /* transformer: {
      from(value: Date): any {
        return value.getTime();
      },
      to(v) {
        return v;
      },
    }, */
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

  // 软删除 typeorm有支持的api  搜索时默认不会带上已经删除的数据，需要删除的数据时使用withDeleted即可
  @DeleteDateColumn({
    type: 'datetime',
    comment: '删除时间',
    select: false,
  })
  deletedAt!: Date | null;

  @BeforeUpdate()
  updateTimestamp() {
    this.updateAt = new Date();
  }
}
