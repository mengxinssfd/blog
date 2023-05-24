import type { CommentEntity } from '@blog/entities';
import { getRegionLocation } from '@blog/shared';
import { filterBrowser, filterOs } from './utils';
import { forEachRight } from '@tool-pack/basic';
export interface CommentTreeType extends CommentEntity {
  children?: CommentTreeType[];
  parent?: CommentTreeType;
  isOrphan?: boolean;
  replyCount: number;
}

export function handleCommentTree(list: CommentEntity[]): CommentTreeType[] {
  // 组装成二级树结构
  const finalList: CommentTreeType[] = [];
  const idMap: Record<string, CommentTreeType> = {};

  const children: CommentTreeType[] = [];

  list.forEach((item) => {
    const newItem = {
      ...item,
      region: getRegionLocation(item.region),
      os: filterOs(item.os),
      browser: filterBrowser(item.browser),
      children: [] as CommentTreeType[],
      replyCount: 0,
    } as CommentTreeType;

    idMap[item.id] = newItem;
    if (!item.parentId) finalList.push(newItem);
    else children.push(newItem);
  });

  const orphans: any[] = [];
  forEachRight(children, (child) => {
    const parent = idMap[child.parentId || ''] || idMap[child.replyId || ''];
    if (!parent) {
      child.isOrphan = true;
      orphans.push(child);
      return;
    }

    if (child.replyId && idMap[child.replyId]) idMap[child.replyId].replyCount++;

    if (!parent.children) parent.children = [];
    parent.children.push(child);
    child.parent = parent;
    if (child.replyId && child.parentId !== child.replyId) {
      child.reply = idMap[child.replyId];
    }
  });

  finalList.push(...orphans.reverse());

  return finalList;
}
