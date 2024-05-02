import { BlogBaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('file')
export class FileEntity extends BlogBaseEntity {
  static override readonly modelName = 'FileEntity' as const;

  @Column('varchar', { comment: 'oss链接', length: 500 })
  url!: string;

  @Column('int', { comment: '文件大小' })
  size!: number;

  @Column('varchar', { comment: '文件名', length: 200, unique: true })
  filename!: string;

  @Column('varchar', { comment: '文件类型', length: 50 })
  mimetype!: string;

  @Column('int', { comment: '创建人ID', nullable: true })
  ownerId!: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner!: UserEntity;
}
