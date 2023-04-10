export interface AnchorTree {
  parent?: AnchorTree;
  children: AnchorTree[];
  label: string;
  id: string;
  tagName: string;
  data?: { indent: number; title: string; id: number | string };
}
