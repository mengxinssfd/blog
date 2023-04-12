import { SetMetadata } from '@nestjs/common';

/**
 * key
 */
export const IS_PUBLIC_AUTH_KEY = Symbol('is public auth?');

/**
 * JwtAuthGuard配套装饰器
 */
export const FreeAuth = () => SetMetadata(IS_PUBLIC_AUTH_KEY, true);
/**
 * JwtAuthGuard配套装饰器
 */
export const JwtAuth = () => SetMetadata(IS_PUBLIC_AUTH_KEY, false);
