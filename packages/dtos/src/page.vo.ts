import { BaseEntity } from 'typeorm';

export class PageVo<T extends BaseEntity> {
  list!: T[];
  count!: number;
}
