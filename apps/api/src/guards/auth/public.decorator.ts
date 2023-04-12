import { SetMetadata } from '@nestjs/common';

/**
 * key
 */
export const IS_PUBLIC_KEY = Symbol('public');

/**
 * JwtAuthGuard配套装饰器
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
/**
 * JwtAuthGuard配套装饰器
 */
export const JwtAuth = () => SetMetadata(IS_PUBLIC_KEY, false);
