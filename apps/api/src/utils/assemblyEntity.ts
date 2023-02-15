import { forEachObj, hasOwn } from '@tool-pack/basic';

export interface CommonParams {
  entityName: string;
  valueToNumArr?: string[];
  omitArr?: string[];
}
export function rawToEntity<T>({
  raw,
  entityName,
  valueToNumArr = [],
  omitArr = [],
}: CommonParams & { raw: Record<string, any> }): T {
  const result: any = {};
  // 转成数字
  valueToNumArr.forEach((key) => {
    if (hasOwn(raw, key)) {
      raw[key] = Number(raw[key]);
    }
  });
  forEachObj(raw, (val, key) => {
    if (omitArr.includes(key)) return;
    const [objName, k] = key.split('_') as [string, string];
    // 没有前缀的情况
    if (!k) {
      result[objName] = val;
      return;
    }
    // 前缀为entity名
    if (objName === entityName) {
      result[k] = val;
      return;
    }
    // 子对象的情况
    if (!result[objName]) result[objName] = {};
    result[objName][k] = val;
  });
  return result;
}

/**
 * @param entityName
 * @param rawList
 * @param valueJoinToArr 转换后的key数组
 * @param valueToNumArr 转换前的key数组
 * @param omitArr 转换前的key数组
 */
export function rawsToEntities<T>({
  entityName,
  rawList,
  valueJoinToArr = [],
  valueToNumArr = [],
  omitArr = [],
}: CommonParams & {
  rawList: any[];
  valueJoinToArr?: string[];
}): T[] {
  const transColKeyList = rawList.map((raw: Record<string, any>) =>
    rawToEntity<T>({ raw, valueToNumArr, omitArr, entityName }),
  );
  const newList: any[] = [];
  // 多个子行的情况需要合成到一行
  transColKeyList.forEach((item: any) => {
    const find = newList.find((it) => it.id === item.id);
    if (!find) {
      valueJoinToArr.forEach((k) => {
        item[k] = [item[k]];
      });
      newList.push(item);
      return;
    }
    // 某一列转为数组 其他不变
    valueJoinToArr.forEach((k) => {
      find[k].push(item[k]);
    });
  });
  return newList;
}
