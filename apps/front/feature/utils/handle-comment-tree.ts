import type { CommentEntity } from '@blog/entities';
import { getRegionLocation } from '@blog/shared';
import { filterBrowser, filterOs } from './utils';
import { forEachRight } from '@tool-pack/basic';
export interface CommentTreeType extends CommentEntity {
  children?: CommentTreeType[];
  parent?: CommentTreeType;
  isOrphan?: boolean;
}

export function handleCommentTree(list: CommentEntity[]): CommentTreeType[] {
  // 组装成二级树结构
  const finalList: CommentTreeType[] = [];
  const idMap: Record<string, CommentTreeType> = {};
  const children: CommentTreeType[] = list.filter((item: CommentTreeType) => {
    idMap[item.id] = item;

    item.region = getRegionLocation(item.region);
    item.os = filterOs(item.os);
    item.browser = filterBrowser(item.browser);

    item.children = [] as CommentTreeType[];
    if (!item.parentId) {
      finalList.push(item);
      return false;
    }
    return true;
  });

  const orphans: any[] = [];
  forEachRight(children, (child) => {
    const parent = idMap[child.parentId || ''] || idMap[child.replyId || ''];
    if (!parent) {
      child.isOrphan = true;
      orphans.push(child);
      return;
    }
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
