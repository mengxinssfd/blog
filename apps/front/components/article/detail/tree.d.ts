import type { CommentEntity } from '@blog/entities';

export interface AnchorTree {
  parent?: AnchorTree;
  children: AnchorTree[];
  label: string;
  id: string;
  tagName: string;
  data?: { indent: number; title: string; id: number | string };
}
export interface CommentTree extends CommentEntity {
  children: CommentTree[];
  parent?: CommentTree;
  isOrphan: boolean;
}
