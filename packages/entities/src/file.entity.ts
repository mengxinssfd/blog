import { BlogBaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';

@Entity('file')
export class FileEntity extends BlogBaseEntity {
  static readonly modelName = 'FileEntity' as const;

  @Column('varchar', { comment: 'oss链接', length: 500 })
  url!: string;

  @Column('int', { comment: '文件大小' })
  size!: number;

  @Column('varchar', { comment: '文件名', length: 200, unique: true })
  filename!: string;

  @Column('varchar', { comment: '文件类型', length: 50 })
  mimetype!: string;
}
