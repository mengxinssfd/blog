export type Validator = (_: unknown, value: string, callback: Function) => void;
export interface ChangeLog {
  date: string;
  title: string;
  scope?: string;
  type: string;
  desc?: string;
  o?: string;
}
