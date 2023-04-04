import type { Transform } from 'class-transformer';

export const strToNum: Parameters<typeof Transform>[0] = (params) => {
  if (params.value) params.value = Number(params.value);
  return params.value;
};
export const toBool: Parameters<typeof Transform>[0] = (params) => {
  console.log('bbbbbb', params);
  if (params.value) params.value = Boolean(params.value);
  return params.value;
};
