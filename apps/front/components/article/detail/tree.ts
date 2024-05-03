export interface AnchorTree {
  parent?: AnchorTree;
  children: AnchorTree[];
  label: string;
  id: string;
  tagName: string;
  index: string;
  active: boolean;
}
