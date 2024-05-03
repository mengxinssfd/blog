import type { Transform } from 'class-transformer';
import { ValidateIf, type ValidationOptions } from 'class-validator';

export const strToNum: Parameters<typeof Transform>[0] = (params) => {
  if (params.value) params.value = Number(params.value);
  return params.value;
};
export const toBool: Parameters<typeof Transform>[0] = (params) => {
  if (params.value) params.value = Boolean(params.value);
  return params.value;
};

/**
 * 跟class-validator官方的认为空字符串有值不一样，自定义的把空字符串当成null、undefined
 * @see {@link https://github.com/typestack/class-validator/issues/326}
 */
export function IsOptional(validationOptions?: ValidationOptions) {
  return ValidateIf((_, value) => {
    return value !== null && value !== undefined && value !== '';
  }, validationOptions);
}

/**
 * 获取数字类枚举值的值
 * @param _enum
 */
export function getNumericEnumValues(_enum: object) {
  return Object.values(_enum).filter((i: any) => typeof i === 'number');
}
