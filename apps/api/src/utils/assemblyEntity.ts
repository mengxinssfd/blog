import { forEachObj, hasOwn } from '@tool-pack/basic';

export interface CommonParams<T> {
  entityName: string;
  valueToNumArr?: string[];
  omitArr?: string[];
  onAfterEach?: ((obj: T) => T) | undefined;
}
export function rawToEntity<T>({
  raw,
  entityName,
  valueToNumArr = [],
  omitArr = [],
  onAfterEach,
}: CommonParams<T> & { raw: Record<string, any> }): T {
  let result: any = {};
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
  if (onAfterEach) result = onAfterEach(result);
  return result;
}

/**
 * @param entityName
 * @param rawList
 * @param valueJoinToArr 转换后的key数组
 * @param valueToNumArr 转换前的key数组
 * @param omitArr 转换前的key数组
 * @param onTransferAfter 转换后的回调
 */
export function rawsToEntities<T>({
  entityName,
  rawList,
  valueJoinToArr = [],
  valueToNumArr = [],
  onAfterEach,
  omitArr = [],
}: CommonParams<T> & {
  rawList: any[];
  valueJoinToArr?: string[];
}): T[] {
  const transColKeyList = rawList.map((raw: Record<string, any>) =>
    rawToEntity<T>({ raw, valueToNumArr, omitArr, entityName, onAfterEach }),
  );
  const newList: any[] = [];
  // 多个子行的情况需要合成到一行
  transColKeyList.forEach((item: any) => {
    const find = newList.find((it) => it?.id === item?.id);
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
