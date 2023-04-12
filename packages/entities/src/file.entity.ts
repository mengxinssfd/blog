import { BlogBaseEntity } from './base.entity';

export class FileEntity extends BlogBaseEntity {
  static readonly modelName = 'FileEntity' as const;
}
