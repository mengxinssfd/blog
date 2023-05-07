import type { CommentEntity } from '@blog/entities';
export interface CommentTreeType extends CommentEntity {
  children?: CommentTree[];
  parent?: CommentTree;
  isOrphan?: boolean;
}
